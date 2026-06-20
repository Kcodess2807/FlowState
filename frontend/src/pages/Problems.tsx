import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { ProblemRow } from "@/components/shared/ProblemRow";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/FadeIn";
import { getProblems, getTopics } from "@/lib/api";
import type { Difficulty, ProblemListItem, Topic } from "@/types";
import { cn } from "@/lib/utils";

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export default function Problems() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  // Server-side filtering; search is debounced so we don't refetch per keystroke.
  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      getProblems({
        difficulty: difficulty ?? undefined,
        topic: activeTopic ?? undefined,
        search: search.trim() || undefined,
      })
        .then((p) => {
          setProblems(p);
          setLoading(false);
        })
        .catch(() => {
          setProblems([]);
          setLoading(false);
        });
    }, 250);
    return () => clearTimeout(handle);
  }, [difficulty, activeTopic, search]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <FadeIn>
          <span className="mono text-xs uppercase tracking-[0.2em] text-accent">
            Practice
          </span>
          <h1 className="relative mt-3 inline-block text-4xl font-bold tracking-tight text-ink">
            Problems
            <DoodleUnderline className="-bottom-3" />
          </h1>
          <p className="mt-5 text-ink-muted">
            Curated system design challenges. Pick one and start diagramming.
          </p>
        </FadeIn>

        {/* Filter bar */}
        <FadeIn delay={0.05}>
          <div className="mt-8 space-y-4 rounded-xl border border-hairline bg-elevated p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search problems…"
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() =>
                      setDifficulty((cur) => (cur === d.value ? null : d.value))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      difficulty === d.value
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-hairline text-ink-muted hover:border-hairline-strong",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono text-xs uppercase tracking-wide text-ink-faint">
                  Topics
                </span>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setActiveTopic((cur) => (cur === t.slug ? null : t.slug))
                    }
                    className={cn(
                      "mono rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                      activeTopic === t.slug
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                        : "border-hairline text-ink-muted hover:border-hairline-strong",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* List */}
        <div className="mt-6 overflow-hidden rounded-xl border border-hairline bg-elevated">
          {loading ? (
            <div className="divide-y divide-hairline">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse px-5 py-5">
                  <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-white/[0.05]" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-hairline">
              {problems.map((p) => (
                <ProblemRow key={p.id} problem={p} />
              ))}
            </div>
          )}
        </div>

        {!loading && problems.length > 0 && (
          <p className="mono mt-4 text-center text-sm text-ink-faint">
            {problems.length} problem{problems.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </SiteLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg viewBox="0 0 120 80" className="h-20 w-28 text-accent/40" fill="none">
        <rect
          x="6"
          y="10"
          width="108"
          height="60"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 8"
        />
        <path
          d="M30 40H90"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
      </svg>
      <h3 className="mt-4 font-semibold text-ink-muted">No problems match</h3>
      <p className="mt-1 text-sm text-ink-faint">
        Try clearing a filter or searching for something else.
      </p>
    </div>
  );
}
