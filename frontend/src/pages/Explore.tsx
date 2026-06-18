import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { SolutionCard } from "@/components/shared/SolutionCard";
import { FadeIn } from "@/components/shared/FadeIn";
import { getSolutions } from "@/lib/api";
import type { ExploreSort, Solution } from "@/types";
import { cn } from "@/lib/utils";

const SORTS: ExploreSort[] = ["Most Liked", "Recent", "By Problem"];

export default function Explore() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<ExploreSort>("Most Liked");

  useEffect(() => {
    setLoading(true);
    getSolutions(sort).then((s) => {
      setSolutions(s);
      setLoading(false);
    });
  }, [sort]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <FadeIn className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Community
            </span>
            <h1 className="relative mt-2 inline-block text-4xl font-extrabold tracking-tight text-slate-900">
              Explore
              <DoodleUnderline className="-bottom-3" />
            </h1>
            <p className="mt-5 text-slate-600">
              Browse solutions shared by the community. Steal ideas, leave a like.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  sort === s
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[16/10] bg-slate-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))
            : solutions.map((s, i) => (
                <FadeIn key={s.id} delay={(i % 3) * 0.06}>
                  <SolutionCard solution={s} />
                </FadeIn>
              ))}
        </div>
      </div>
    </SiteLayout>
  );
}
