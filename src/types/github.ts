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
    laugh: number;
    confused: number;
    hooray: number;
    rocket: number;
    eyes: number;
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
  | "created-desc"  // 作成日（降順：新しい順）
  | "created-asc"   // 作成日（昇順：古い順）
  | "updated-desc"  // 更新日（降順：新しい順）
  | "updated-asc";  // 更新日（昇順：古い順）
