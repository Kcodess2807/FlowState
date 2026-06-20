import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./DifficultyBadge";
import type { ProblemListItem } from "@/types";

export function ProblemRow({ problem }: { problem: ProblemListItem }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/problems/${problem.slug}`}
            className="truncate font-semibold text-ink hover:text-accent"
          >
            {problem.title}
          </Link>
          <DifficultyBadge difficulty={problem.difficulty} />
          {!problem.is_published && <Badge variant="hard">Draft</Badge>}
        </div>
        {problem.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.topics.map((t) => (
              <Badge key={t.id} variant="neutral">
                {t.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <Button size="sm" asChild>
          <Link to={`/problems/${problem.slug}`}>Solve</Link>
        </Button>
      </div>
    </div>
  );
}
