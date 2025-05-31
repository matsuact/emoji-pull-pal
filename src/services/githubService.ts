
import { PullRequest, PullRequestDetails, Comment, Reaction, SortOption } from "../types/github";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://api.github.com";

/**
 * Helper function to add auth headers if authenticated
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json"
  };
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      headers["Authorization"] = `token ${session.provider_token}`;
    }
  } catch (error) {
    console.error("Error getting auth headers:", error);
  }
  
  return headers;
};

/**
 * Fetch pull requests with pagination and sorting
 */
export const fetchPullRequests = async (
  owner: string, 
  repo: string, 
  page: number = 1, 
  perPage: number = 10,
  sort: SortOption = "created-desc",
  searchQuery: string = ""
): Promise<{pullRequests: PullRequest[], totalCount: number}> => {
  try {
    // Convert our sort option to GitHub API parameters
    // Format is "<field>-<direction>" like "created-desc"
    const [sortField, direction] = sort.split('-');
    
    // Handle search query separately from regular pull request fetching
    if (searchQuery) {
      return await fetchPullRequestsWithSearch(owner, repo, searchQuery, page, perPage, sortField, direction);
    }
    
    // Regular PR fetching without search
    const url = `${BASE_URL}/repos/${owner}/${repo}/pulls?state=all&sort=${sortField}&direction=${direction}&page=${page}&per_page=${perPage}`;
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pull requests: ${response.status}`);
    }
    
    // Get total count from header
    const linkHeader = response.headers.get("Link");
    let totalCount = 0;
    
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)&per_page=\d+>; rel="last"/);
      if (lastPageMatch && lastPageMatch[1]) {
        totalCount = parseInt(lastPageMatch[1]) * perPage;
      }
    }
    
    // If link header is missing, assume we're on the last page
    const data = await response.json();
    if (totalCount === 0) {
      totalCount = (page - 1) * perPage + data.length;
    }
    
    const pullRequests = data.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url
      },
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      comments: pr.comments || 0 // Make sure we're also returning the comments count
    }));
    
    return { pullRequests, totalCount };
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    throw error;
  }
};

/**
 * Fetch pull requests with search query
 */
const fetchPullRequestsWithSearch = async (
  owner: string,
  repo: string,
  query: string,
  page: number = 1,
  perPage: number = 10,
  sort: string = "created",
  direction: string = "desc"
): Promise<{pullRequests: PullRequest[], totalCount: number}> => {
  try {
    // GitHub Search API requires a different endpoint and format
    const searchQuery = encodeURIComponent(`${query} repo:${owner}/${repo} is:pr`);
    const url = `${BASE_URL}/search/issues?q=${searchQuery}&sort=${sort}&order=${direction}&page=${page}&per_page=${perPage}`;
    
    const headers = await getAuthHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to search pull requests: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Search API gives us total_count directly
    const totalCount = data.total_count || 0;
    
    // Map search results to our PullRequest format
    const pullRequests = data.items.map((item: any) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      // Search API doesn't indicate if PR is merged, only open/closed
      state: item.state,
      user: {
        login: item.user.login,
        avatar_url: item.user.avatar_url
      },
      created_at: item.created_at,
      updated_at: item.updated_at,
      comments: item.comments || 0
    }));
    
    return { pullRequests, totalCount };
  } catch (error) {
    console.error("Error searching pull requests:", error);
    throw error;
  }
};

export const fetchPullRequestDetails = async (owner: string, repo: string, prNumber: number): Promise<PullRequestDetails> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pull request details: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      state: data.merged_at ? "merged" : data.state,
      body: data.body || "",
      user: {
        login: data.user.login,
        avatar_url: data.user.avatar_url
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
      comments_url: data.comments_url
    };
  } catch (error) {
    console.error("Error fetching pull request details:", error);
    throw error;
  }
};

export const fetchPullRequestComments = async (owner: string, repo: string, prNumber: number): Promise<Comment[]> => {
  try {
    const issueCommentsUrl = `${BASE_URL}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    const headers = await getAuthHeaders();
    const response = await fetch(issueCommentsUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((comment: any) => ({
      id: comment.id,
      user: {
        login: comment.user.login,
        avatar_url: comment.user.avatar_url
      },
      body: comment.body,
      created_at: comment.created_at,
      reactions: comment.reactions ? {
        "+1": comment.reactions["+1"],
        "-1": comment.reactions["-1"],
        heart: comment.reactions.heart,
        smile: comment.reactions.smile,
        frown: comment.reactions.frown
      } : undefined
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const addReaction = async (
  owner: string, 
  repo: string, 
  id: number, 
  reaction: string,
  type: 'comment' | 'issue' = 'comment'
): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      throw new Error("Authentication required to add reactions");
    }
    
    // GitHubのリアクション形式に変換
    const reactionMap: Record<string, string> = {
      'thumbs_up': '+1',
      'thumbs_down': '-1',
      'smile': 'laugh',
      'frown': 'confused',
      'heart': 'heart'
    };
    
    const githubReaction = reactionMap[reaction] || reaction;
    console.log(`Adding reaction: ${githubReaction} to ${type} ${id}`);
    
    // プルリクエスト本体へのリアクションかコメントへのリアクションかを判別
    let url: string;
    if (type === 'issue') {
      // プルリクエスト本体（issueとして扱われる）
      url = `${BASE_URL}/repos/${owner}/${repo}/issues/${id}/reactions`;
    } else {
      // コメント
      url = `${BASE_URL}/repos/${owner}/${repo}/issues/comments/${id}/reactions`;
    }
    
    const headers = await getAuthHeaders();
    // リアクションAPI用のAcceptヘッダーを設定
    headers["Accept"] = "application/vnd.github+json";
    headers["X-GitHub-Api-Version"] = "2022-11-28";
    
    console.log(`Making request to: ${url}`);
    console.log(`With reaction content: ${githubReaction}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: githubReaction })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response:`, errorText);
      throw new Error(`Failed to add reaction: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Successfully added ${githubReaction} reaction:`, result);
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};
