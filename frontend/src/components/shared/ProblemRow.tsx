import { Link } from "react-router-dom";
import { IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./DifficultyBadge";
import type { Problem } from "@/types";
import { formatCount } from "@/lib/utils";

export function ProblemRow({ problem }: { problem: Problem }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-brand-50/40 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <Link
            to={`/problems/${problem.slug}`}
            className="truncate font-semibold text-slate-900 hover:text-brand-700"
          >
            {problem.title}
          </Link>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {problem.summary}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
          <IconUsers size={16} />
          {formatCount(problem.solveCount)}
        </span>
        <Button size="sm" asChild>
          <Link to={`/problems/${problem.slug}`}>Solve</Link>
        </Button>
      </div>
    </div>
  );
}
