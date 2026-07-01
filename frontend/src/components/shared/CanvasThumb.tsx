import { DotGrid } from "./DotGrid";
import { cn } from "@/lib/utils";

export function CanvasThumb({ className }: { className?: string }) {
  return (
    <DotGrid
      className={cn(
        "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-hairline",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 120"
        className="h-3/4 w-3/4 text-ink-faint"
        fill="none"
        aria-hidden="true"
      >
        <rect x="14" y="20" width="44" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
        <rect x="142" y="20" width="44" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
        <rect x="78" y="74" width="44" height="24" rx="4" stroke="rgb(var(--accent))" strokeWidth="2" />
        <path
          d="M58 32H142"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
        <path
          d="M36 44C36 64 78 70 92 74"
          stroke="rgb(var(--accent))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
        <path
          d="M164 44C164 64 122 70 108 74"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
      </svg>
    </DotGrid>
  );
}
