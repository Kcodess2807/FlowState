import { Link } from "react-router-dom";
import { ArrowRight01Icon, UserMultipleIcon } from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./DifficultyBadge";
import type { Problem } from "@/types";
import { formatCount } from "@/lib/utils";

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-elevated p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-lg"
    >
      <div className="flex items-center justify-between">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
          <UserMultipleIcon size={14} />
          {formatCount(problem.solveCount)}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
        {problem.title}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-muted">
        {problem.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
        Solve
        <ArrowRight01Icon
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
