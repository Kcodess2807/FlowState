export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Tag {
  id: string;
  label: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  /** Short one-liner shown in lists. */
  summary: string;
  /** Full markdown-ish statement shown on the detail page. */
  statement: string;
  constraints: string[];
  hints: string[];
  tags: string[];
  solveCount: number;
}

export interface Author {
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface Solution {
  id: string;
  problemSlug: string;
  problemTitle: string;
  author: Author;
  /** Thumbnail URL; empty string renders the dot-grid placeholder. */
  thumbnailUrl: string;
  likeCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string; // ISO date
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
  joinedAt: string; // ISO date
  stats: {
    problemsSolved: number;
    solutionsShared: number;
    likesReceived: number;
  };
  savedProblems: string[]; // problem slugs
}

/** Matches the backend `UserRead` schema. */
export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

/** Matches the backend `TokenPair` schema. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export type ExploreSort = "Most Liked" | "Recent" | "By Problem";
