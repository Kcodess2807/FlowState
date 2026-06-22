import { useEffect, useState } from "react";
import { Search01Icon } from "hugeicons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { ProblemRow } from "@/components/shared/ProblemRow";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/FadeIn";
import { getProblems } from "@/lib/api";
import type { Difficulty, ProblemListItem, Problem } from "@/types";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/lib/mock-data";

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export default function Problems() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Server-side filtering; search is debounced so we don't refetch per keystroke.
  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      getProblems({
        difficulty: difficulty ?? undefined,
        topic: activeTag ?? undefined,
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
  }, [difficulty, activeTag, search]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <FadeIn>
          <span className="mono text-xs uppercase tracking-[0.2em] text-accent">
            Practice
          </span>
          <h1 className="relative mt-2 inline-block font-display text-5xl font-semibold tracking-tight text-ink">
            Problems
            <DoodleUnderline className="-bottom-3" />
          </h1>
          <p className="mt-5 text-ink-muted">
            Curated system design challenges. Pick one and start diagramming.
          </p>
        </FadeIn>

        {/* Filter bar */}
        <FadeIn delay={0.05}>
          <div className="mt-8 space-y-4 rounded-lg border border-hairline bg-elevated p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search01Icon
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
                      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      difficulty === d.value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hairline text-ink-muted hover:border-accent/40",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Tags
              </span>
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTag((cur) => (cur === tag ? null : tag))
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    activeTag === tag
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-hairline text-ink-muted hover:border-accent/40",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* List */}
        <div className="mt-6 overflow-hidden rounded-lg border border-hairline bg-elevated">
          {loading ? (
            <div className="divide-y divide-hairline">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse px-5 py-5">
                  <div className="h-4 w-1/3 rounded bg-ink/[0.06]" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-ink/[0.06]" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-hairline">
              {problems.map((p) => (
                <ProblemRow key={p.id} problem={p as Problem} />
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
      <svg
        viewBox="0 0 120 80"
        className="h-20 w-28 text-accent/40"
        fill="none"
      >
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
