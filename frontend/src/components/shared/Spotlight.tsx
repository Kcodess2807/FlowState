import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle interactive card wrapper: a clean lift with an accent border on hover.
 * (No gradients — editorial restraint.)
 */
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
