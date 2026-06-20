export type Difficulty = "easy" | "medium" | "hard";

export interface Topic {
  id: string;
  slug: string;
  name: string;
}

export interface RubricCriterion {
  key: string;
  title: string;
  description: string;
  weight: number;
}

/** Compact problem shape returned by the list endpoint. */
export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  is_published: boolean;
  topics: Topic[];
}

/** Full problem returned by the detail endpoint. */
export interface Problem extends ProblemListItem {
  description: string;
  rubric: RubricCriterion[];
  reference_solution: string | null;
  created_at: string;
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
