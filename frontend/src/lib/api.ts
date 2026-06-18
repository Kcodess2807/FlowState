import type {
  AuthUser,
  ExploreSort,
  Problem,
  Profile,
  Solution,
  TokenPair,
} from "@/types";
import {
  MOCK_PROBLEMS,
  MOCK_PROFILES,
  MOCK_SOLUTIONS,
} from "./mock-data";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "flowstate.accessToken";
const REFRESH_TOKEN_KEY = "flowstate.refreshToken";

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(pair: TokenPair) {
    localStorage.setItem(ACCESS_TOKEN_KEY, pair.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, pair.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = tokenStore.access;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Could not reach the server. Is the backend running?");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function login(
  email: string,
  password: string,
): Promise<TokenPair> {
  const pair = await request<TokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  tokenStore.set(pair);
  return pair;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  return request<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      display_name: displayName,
    }),
  });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

export function logout(): void {
  tokenStore.clear();
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface ActivitySummary {
  from_date: string;
  to_date: string;
  total_contributions: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
  daily: ActivityDay[];
}

export function getMyActivity(year?: number): Promise<ActivitySummary> {
  const q = year ? `?year=${year}` : "";
  return request<ActivitySummary>(`/me/activity${q}`);
}

export function getUserActivity(
  userId: string,
  year?: number,
): Promise<ActivitySummary> {
  const q = year ? `?year=${year}` : "";
  return request<ActivitySummary>(`/users/${userId}/activity${q}`);
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface CanvasMeta {
  id: string;
  workspace_id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

const PRACTICE_WORKSPACE_NAME = "FlowState Practice";

export function listWorkspaces(): Promise<Workspace[]> {
  return request<Workspace[]>("/workspaces");
}

export function createWorkspace(name: string): Promise<Workspace> {
  return request<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listCanvases(workspaceId: string): Promise<CanvasMeta[]> {
  return request<CanvasMeta[]>(`/workspaces/${workspaceId}/canvases`);
}

export function createCanvas(
  workspaceId: string,
  name: string,
): Promise<CanvasMeta> {
  return request<CanvasMeta>(`/workspaces/${workspaceId}/canvases`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getOrCreateProblemCanvas(
  problemTitle: string,
): Promise<CanvasMeta> {
  const workspaces = await listWorkspaces();
  let workspace =
    workspaces.find((w) => w.name === PRACTICE_WORKSPACE_NAME) ??
    workspaces[0];
  if (!workspace) workspace = await createWorkspace(PRACTICE_WORKSPACE_NAME);

  const canvases = await listCanvases(workspace.id);
  const existing = canvases.find((c) => c.name === problemTitle);
  return existing ?? createCanvas(workspace.id, problemTitle);
}

export function canvasSocketUrl(canvasId: string, since: number): string {
  const httpBase = API_BASE_URL.replace(/\/$/, "");
  const wsBase = httpBase.replace(/^http/, "ws");
  const token = tokenStore.access ?? "";
  const params = new URLSearchParams({ token, since: String(since) });
  return `${wsBase}/canvases/${canvasId}/ws?${params.toString()}`;
}

const delay = <T>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export async function getProblems(): Promise<Problem[]> {
  // TODO: GET /api/v1/problems
  return delay(MOCK_PROBLEMS);
}

export async function getProblem(slug: string): Promise<Problem | undefined> {
  // TODO: GET /api/v1/problems/{slug}
  return delay(MOCK_PROBLEMS.find((p) => p.slug === slug));
}

export async function getSolutions(
  sort: ExploreSort = "Recent",
  problemSlug?: string,
): Promise<Solution[]> {
  // TODO: GET /api/v1/solutions?sort=&problem=
  let list = [...MOCK_SOLUTIONS];
  if (problemSlug) list = list.filter((s) => s.problemSlug === problemSlug);
  if (sort === "Most Liked") list.sort((a, b) => b.likeCount - a.likeCount);
  else if (sort === "Recent")
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  else list.sort((a, b) => a.problemTitle.localeCompare(b.problemTitle));
  return delay(list);
}

export async function getProfile(
  username: string,
): Promise<Profile | undefined> {
  // TODO: GET /api/v1/profiles/{username}
  return delay(MOCK_PROFILES[username]);
}

export async function getSolutionsByAuthor(
  username: string,
): Promise<Solution[]> {
  // TODO: GET /api/v1/profiles/{username}/solutions
  return delay(MOCK_SOLUTIONS.filter((s) => s.author.username === username));
}

export async function submitSolution(slug: string): Promise<{ ok: true }> {
  // TODO: POST /api/v1/problems/{slug}/solutions
  void slug;
  return delay({ ok: true } as const, 600);
}
