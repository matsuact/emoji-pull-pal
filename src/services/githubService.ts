
import { PullRequest, PullRequestDetails, Comment, Reaction } from "../types/github";

const BASE_URL = "https://api.github.com";

export const fetchPullRequests = async (owner: string, repo: string): Promise<PullRequest[]> => {
  try {
    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls?state=all`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pull requests: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url
      },
      created_at: pr.created_at,
      updated_at: pr.updated_at
    }));
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    throw error;
  }
};

export const fetchPullRequestDetails = async (owner: string, repo: string, prNumber: number): Promise<PullRequestDetails> => {
  try {
    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`);
    
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
    const response = await fetch(issueCommentsUrl);
    
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
  console.log(`Adding ${reaction} reaction to comment ${commentId} (Simulation)`);
  // In a real implementation, this would make a POST request to GitHub's API
  // Note: This requires authentication which is beyond the scope of this demo
  // The actual endpoint would be:
  // POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions
  
  // For now, we're just logging the action since we don't have auth set up
};
