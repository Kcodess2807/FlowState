import { useEffect, useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { ProblemRow } from "@/components/shared/ProblemRow";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/FadeIn";
import { getProblems } from "@/lib/api";
import { ALL_TAGS } from "@/lib/mock-data";
import type { Difficulty, Problem } from "@/types";
import { cn } from "@/lib/utils";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    getProblems().then((p) => {
      setProblems(p);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (difficulty && p.difficulty !== difficulty) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.summary.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [problems, difficulty, activeTag, search]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <FadeIn>
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            Practice
          </span>
          <h1 className="relative mt-2 inline-block text-4xl font-extrabold tracking-tight text-slate-900">
            Problems
            <DoodleUnderline className="-bottom-3" />
          </h1>
          <p className="mt-5 text-slate-600">
            Curated system design challenges. Pick one and start diagramming.
          </p>
        </FadeIn>

        {/* Filter bar */}
        <FadeIn delay={0.05}>
          <div className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                    key={d}
                    type="button"
                    onClick={() =>
                      setDifficulty((cur) => (cur === d ? null : d))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      difficulty === d
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tags
              </span>
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag((cur) => (cur === tag ? null : tag))}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    activeTag === tag
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* List */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse px-5 py-5">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <ProblemRow key={p.id} problem={p} />
              ))}
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="mt-4 text-center text-sm text-slate-400">
            Showing {filtered.length} of {problems.length} problems
          </p>
        )}
      </div>
    </SiteLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg viewBox="0 0 120 80" className="h-20 w-28 text-brand-300" fill="none">
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
      <h3 className="mt-4 font-semibold text-slate-700">No problems match</h3>
      <p className="mt-1 text-sm text-slate-500">
        Try clearing a filter or searching for something else.
      </p>
    </div>
  );
}
