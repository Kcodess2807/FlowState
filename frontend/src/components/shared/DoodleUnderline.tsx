import { cn } from "@/lib/utils";

export function DoodleUnderline({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute -bottom-2 left-0 h-3 w-full text-accent",
        className,
      )}
      fill="none"
    >
      <path
        d="M3 11C40 4 72 4 110 8C150 12 196 12 237 5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={animate ? 240 : undefined}
        className={animate ? "animate-draw" : undefined}
      />
    </svg>
  );
}
