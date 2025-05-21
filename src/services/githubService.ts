
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
  sort: SortOption = "newest",
  searchQuery: string = ""
): Promise<{pullRequests: PullRequest[], totalCount: number}> => {
  try {
    // Convert our sort option to GitHub API parameters
    let apiSort = "created";
    let direction = "desc";
    
    switch (sort) {
      case "oldest":
        apiSort = "created";
        direction = "asc";
        break;
      case "most-comments":
        apiSort = "comments";
        direction = "desc";
        break;
      case "least-comments":
        apiSort = "comments";
        direction = "asc";
        break;
      case "newest":
      default:
        apiSort = "created";
        direction = "desc";
        break;
    }
    
    // Build query string with search if provided
    let queryParams = `state=all&sort=${apiSort}&direction=${direction}&page=${page}&per_page=${perPage}`;
    
    // Add search query if provided
    if (searchQuery) {
      // For GitHub API, you need to search using q parameter
      queryParams += `&q=${encodeURIComponent(searchQuery)}+repo:${owner}/${repo}+is:pr`;
    }
    
    // GitHub API endpoint for pull requests with sort parameters
    const url = `${BASE_URL}/repos/${owner}/${repo}/pulls?${queryParams}`;
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
    if (totalCount === 0) {
      totalCount = (page - 1) * perPage + (await response.json()).length;
    }
    
    const data = await response.json();
    
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
  commentId: number, 
  reaction: string
): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      throw new Error("Authentication required to add reactions");
    }
    
    const url = `${BASE_URL}/repos/${owner}/${repo}/issues/comments/${commentId}/reactions`;
    const headers = await getAuthHeaders();
    headers["Accept"] = "application/vnd.github.squirrel-girl-preview+json";
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: reaction })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add reaction: ${response.status}`);
    }
    
    console.log(`Added ${reaction} reaction to comment ${commentId}`);
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};
