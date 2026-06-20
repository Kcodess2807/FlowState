import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./DifficultyBadge";
import type { ProblemListItem } from "@/types";

export function ProblemCard({ problem }: { problem: ProblemListItem }) {
  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-elevated p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow-sm"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <DifficultyBadge difficulty={problem.difficulty} />
        {!problem.is_published && <Badge variant="hard">Draft</Badge>}
      </div>
      <h3 className="mt-3 font-bold text-ink group-hover:text-accent">
        {problem.title}
      </h3>
      <div className="mt-3 flex flex-1 flex-wrap items-start gap-1.5">
        {problem.topics.slice(0, 3).map((t) => (
          <Badge key={t.id} variant="neutral">
            {t.name}
          </Badge>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
        Solve
        <IconArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
