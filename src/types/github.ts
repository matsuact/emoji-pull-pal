
export interface Repository {
  owner: string;
  name: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  comments?: number; // コメント数を追加
}

export interface PullRequestDetails extends PullRequest {
  body: string;
  comments_url: string;
}

export interface Comment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  created_at: string;
  reactions?: {
    "+1": number;
    "-1": number;
    heart: number;
    smile: number;
    frown: number;
  };
}

export interface Reaction {
  id: number;
  content: string;
  user: {
    login: string;
  };
}

export interface GithubUser {
  login: string;
  avatar_url: string;
  name?: string;
}

export type SortOption = 
  | "newest"  // created (desc)
  | "oldest"  // created (asc)
  | "updated"; // updated (desc)
