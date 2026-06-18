import { Link } from "react-router-dom";
import { IconArrowRight, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./DifficultyBadge";
import type { Problem } from "@/types";
import { formatCount } from "@/lib/utils";

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <IconUsers size={14} />
          {formatCount(problem.solveCount)}
        </span>
      </div>
      <h3 className="mt-3 font-bold text-slate-900 group-hover:text-brand-700">
        {problem.title}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">
        {problem.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        Solve
        <IconArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
