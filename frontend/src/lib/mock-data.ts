import type { Profile, Solution } from "@/types";

/** Stable avatar helper (DiceBear, no network key required). */
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ccfbf1`;

// NOTE: problems/topics are now served by the real backend (see lib/api.ts).
// Only solutions and profiles remain mocked until those endpoints land.

const MOCK_PROBLEMS = [
  {
    id: "p1",
    slug: "design-url-shortener",
    title: "Design a URL Shortener",
    difficulty: "Easy",
    summary:
      "Build a service like TinyURL that maps long URLs to short, unique aliases.",
    statement:
      "Design a URL shortening service. Given a long URL, the system returns a short alias; visiting the alias redirects to the original URL. Think about how aliases are generated, stored, and resolved at scale, and how you'd handle custom aliases and analytics.",
    constraints: [
      "~100M new URLs per month",
      "Read:write ratio of roughly 100:1",
      "Aliases should be 7 characters or fewer",
      "Redirect latency under 100ms (p99)",
    ],
    hints: [
      "Consider base62 encoding of an auto-incrementing ID.",
      "A cache (e.g. Redis) in front of the datastore handles the read-heavy load.",
      "Decide between hashing and a key-generation service to avoid collisions.",
    ],
    tags: ["Hashing", "Caching", "Databases"],
    solveCount: 4821,
  },
  {
    id: "p2",
    slug: "design-rate-limiter",
    title: "Design a Rate Limiter",
    difficulty: "Medium",
    summary:
      "Throttle requests per client to protect an API from abuse and overload.",
    statement:
      "Design a distributed rate limiter that restricts each client to N requests per time window. It should work across many API servers, fail open vs. closed predictably, and return clear signals to clients when they are throttled.",
    constraints: [
      "Limit configurable per route and per client",
      "Must work across a fleet of stateless API nodes",
      "Sub-millisecond decision overhead",
      "Survive a single cache node failure",
    ],
    hints: [
      "Compare token bucket, leaky bucket, and sliding window log.",
      "A centralized Redis counter trades latency for accuracy.",
      "Return 429 with a Retry-After header.",
    ],
    tags: ["Rate Limiting", "Caching", "Distributed Systems"],
    solveCount: 3140,
  },
  {
    id: "p3",
    slug: "design-news-feed",
    title: "Design a News Feed",
    difficulty: "Medium",
    summary:
      "Generate and serve a personalized, ranked feed for millions of users.",
    statement:
      "Design a social news feed (like Twitter/Facebook). Users follow others and see a ranked timeline of recent posts. Consider fan-out strategies, ranking, and how to keep the feed fresh without overwhelming the datastore.",
    constraints: [
      "10M daily active users",
      "Average user follows ~300 accounts",
      "Feed load under 200ms",
      "Mix of celebrity (high fan-out) and normal accounts",
    ],
    hints: [
      "Compare fan-out-on-write vs. fan-out-on-read.",
      "Hybrid: precompute for normal users, pull for celebrities.",
      "A feed cache per user keyed by user ID.",
    ],
    tags: ["Caching", "Databases", "Load Balancing"],
    solveCount: 2675,
  },
  {
    id: "p4",
    slug: "design-chat-system",
    title: "Design a Chat System",
    difficulty: "Hard",
    summary:
      "Realtime 1:1 and group messaging with presence and delivery guarantees.",
    statement:
      "Design a realtime chat system supporting 1:1 and group conversations, online presence, and message history. Consider connection management, message ordering, delivery/read receipts, and offline delivery.",
    constraints: [
      "50M concurrent connections",
      "Messages delivered in under 500ms",
      "At-least-once delivery with dedup",
      "Message history retained indefinitely",
    ],
    hints: [
      "WebSocket gateways with a session/presence service.",
      "A message queue decouples ingestion from fan-out.",
      "Sequence numbers per conversation give ordering.",
    ],
    tags: ["WebSockets", "Message Queues", "Distributed Systems"],
    solveCount: 1502,
  },
  {
    id: "p5",
    slug: "design-distributed-cache",
    title: "Design a Distributed Cache",
    difficulty: "Hard",
    summary:
      "Build a horizontally scalable, highly available in-memory cache layer.",
    statement:
      "Design a distributed caching system (like Redis Cluster or Memcached). Address data partitioning, replication, eviction, and how clients discover which node owns a key.",
    constraints: [
      "Terabytes of cached data across nodes",
      "p99 GET latency under 5ms",
      "Tolerate node failures without data loss for hot keys",
      "Support LRU and TTL eviction",
    ],
    hints: [
      "Consistent hashing minimizes reshuffling on membership change.",
      "Replication factor of 2–3 for availability.",
      "Client-side or proxy-based routing of keys.",
    ],
    tags: ["Caching", "Consistent Hashing", "Distributed Systems"],
    solveCount: 1188,
  },
  {
    id: "p6",
    slug: "design-typeahead",
    title: "Design Search Autocomplete",
    difficulty: "Easy",
    summary:
      "Suggest top queries as the user types, ranked by popularity.",
    statement:
      "Design the autocomplete (typeahead) feature of a search box. As the user types a prefix, return the top-k most relevant completions quickly. Consider how suggestions are built, ranked, and refreshed.",
    constraints: [
      "Suggestions returned in under 50ms",
      "Top 5 completions per prefix",
      "Trillions of historical queries to mine",
      "Ranking refreshed roughly daily",
    ],
    hints: [
      "A trie with precomputed top-k at each node.",
      "Offline pipeline aggregates query frequencies.",
      "Cache hot prefixes at the edge.",
    ],
    tags: ["Tries", "Caching", "Databases"],
    solveCount: 3902,
  },
];

export const ALL_TAGS: string[] = Array.from(
  new Set(MOCK_PROBLEMS.flatMap((p) => p.tags)),
).sort();

export const MOCK_SOLUTIONS: Solution[] = [
  {
    id: "s1",
    problemSlug: "design-url-shortener",
    problemTitle: "Design a URL Shortener",
    author: { username: "ada", displayName: "Ada Okeke", avatarUrl: avatar("ada") },
    thumbnailUrl: "",
    likeCount: 342,
    viewCount: 5120,
    tags: ["Hashing", "Caching"],
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "s2",
    problemSlug: "design-chat-system",
    problemTitle: "Design a Chat System",
    author: { username: "ravi", displayName: "Ravi Menon", avatarUrl: avatar("ravi") },
    thumbnailUrl: "",
    likeCount: 511,
    viewCount: 8740,
    tags: ["WebSockets", "Message Queues"],
    createdAt: "2026-06-12T14:30:00Z",
  },
  {
    id: "s3",
    problemSlug: "design-news-feed",
    problemTitle: "Design a News Feed",
    author: { username: "lin", displayName: "Lin Zhao", avatarUrl: avatar("lin") },
    thumbnailUrl: "",
    likeCount: 287,
    viewCount: 4310,
    tags: ["Caching", "Load Balancing"],
    createdAt: "2026-06-16T08:15:00Z",
  },
  {
    id: "s4",
    problemSlug: "design-rate-limiter",
    problemTitle: "Design a Rate Limiter",
    author: { username: "marco", displayName: "Marco Silva", avatarUrl: avatar("marco") },
    thumbnailUrl: "",
    likeCount: 198,
    viewCount: 3025,
    tags: ["Rate Limiting", "Distributed Systems"],
    createdAt: "2026-06-10T19:45:00Z",
  },
  {
    id: "s5",
    problemSlug: "design-distributed-cache",
    problemTitle: "Design a Distributed Cache",
    author: { username: "ada", displayName: "Ada Okeke", avatarUrl: avatar("ada") },
    thumbnailUrl: "",
    likeCount: 423,
    viewCount: 6650,
    tags: ["Caching", "Consistent Hashing"],
    createdAt: "2026-06-14T11:20:00Z",
  },
  {
    id: "s6",
    problemSlug: "design-typeahead",
    problemTitle: "Design Search Autocomplete",
    author: { username: "sofia", displayName: "Sofia Park", avatarUrl: avatar("sofia") },
    thumbnailUrl: "",
    likeCount: 156,
    viewCount: 2480,
    tags: ["Tries", "Caching"],
    createdAt: "2026-06-17T16:05:00Z",
  },
  {
    id: "s7",
    problemSlug: "design-url-shortener",
    problemTitle: "Design a URL Shortener",
    author: { username: "marco", displayName: "Marco Silva", avatarUrl: avatar("marco") },
    thumbnailUrl: "",
    likeCount: 274,
    viewCount: 3990,
    tags: ["Hashing", "Databases"],
    createdAt: "2026-06-11T09:00:00Z",
  },
  {
    id: "s8",
    problemSlug: "design-news-feed",
    problemTitle: "Design a News Feed",
    author: { username: "ravi", displayName: "Ravi Menon", avatarUrl: avatar("ravi") },
    thumbnailUrl: "",
    likeCount: 389,
    viewCount: 5870,
    tags: ["Load Balancing", "Databases"],
    createdAt: "2026-06-13T13:10:00Z",
  },
];

export const MOCK_PROFILES: Record<string, Profile> = {
  ada: {
    username: "ada",
    displayName: "Ada Okeke",
    bio: "Backend engineer obsessed with distributed systems and clean architecture. Practicing one design a day.",
    avatarUrl: avatar("ada"),
    githubUrl: "https://github.com/ada",
    joinedAt: "2025-11-02T00:00:00Z",
    stats: { problemsSolved: 42, solutionsShared: 12, likesReceived: 1840 },
    savedProblems: ["design-chat-system", "design-distributed-cache"],
  },
  ravi: {
    username: "ravi",
    displayName: "Ravi Menon",
    bio: "Realtime systems nerd. WebSockets, queues, and the occasional Raft rabbit hole.",
    avatarUrl: avatar("ravi"),
    githubUrl: "https://github.com/ravi",
    joinedAt: "2025-09-21T00:00:00Z",
    stats: { problemsSolved: 58, solutionsShared: 19, likesReceived: 2510 },
    savedProblems: ["design-news-feed"],
  },
  lin: {
    username: "lin",
    displayName: "Lin Zhao",
    bio: "Frontend by day, systems by night. Learning to draw better boxes and arrows.",
    avatarUrl: avatar("lin"),
    githubUrl: "https://github.com/lin",
    joinedAt: "2026-01-15T00:00:00Z",
    stats: { problemsSolved: 23, solutionsShared: 7, likesReceived: 640 },
    savedProblems: ["design-url-shortener", "design-rate-limiter"],
  },
  marco: {
    username: "marco",
    displayName: "Marco Silva",
    bio: "Platform engineer. I like rate limiters more than is healthy.",
    avatarUrl: avatar("marco"),
    githubUrl: "https://github.com/marco",
    joinedAt: "2025-12-08T00:00:00Z",
    stats: { problemsSolved: 37, solutionsShared: 11, likesReceived: 1290 },
    savedProblems: ["design-distributed-cache"],
  },
  sofia: {
    username: "sofia",
    displayName: "Sofia Park",
    bio: "Search and relevance engineer. Tries, ranking, and tasteful caching.",
    avatarUrl: avatar("sofia"),
    githubUrl: "https://github.com/sofia",
    joinedAt: "2026-02-27T00:00:00Z",
    stats: { problemsSolved: 19, solutionsShared: 5, likesReceived: 410 },
    savedProblems: ["design-typeahead", "design-news-feed"],
  },
};
