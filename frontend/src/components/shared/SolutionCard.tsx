import { Link } from "react-router-dom";
import { IconEye, IconHeart } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CanvasThumb } from "./CanvasThumb";
import { Button } from "@/components/ui/button";
import { Spotlight } from "./Spotlight";
import type { Solution } from "@/types";
import { formatCount } from "@/lib/utils";

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Spotlight className="group h-full overflow-hidden border border-hairline bg-elevated">
      <div className="relative overflow-hidden rounded-t-2xl">
        <CanvasThumb className="rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 backdrop-blur-[1px] transition-all duration-200 group-hover:bg-slate-900/40 group-hover:opacity-100">
          <Button size="sm" asChild>
            <Link to={`/problems/${solution.problemSlug}`}>View Solution</Link>
          </Button>
        </div>
      </div>

      <div className="relative p-4">
        <Link
          to={`/problems/${solution.problemSlug}`}
          className="line-clamp-1 font-semibold text-ink hover:text-accent"
        >
          {solution.problemTitle}
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <Link
            to={`/profile/${solution.author.username}`}
            className="flex items-center gap-2"
          >
            <Avatar
              src={solution.author.avatarUrl}
              alt={solution.author.displayName}
              size={26}
            />
            <span className="text-sm text-ink-muted hover:text-ink">
              {solution.author.displayName}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm text-ink-faint">
            <span className="inline-flex items-center gap-1">
              <IconHeart size={15} className="text-rose-400" />
              {formatCount(solution.likeCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconEye size={15} />
              {formatCount(solution.viewCount)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {solution.tags.map((tag) => (
            <Badge key={tag} variant="cyan">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Spotlight>
  );
}
