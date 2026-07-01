import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Display emphasis: a word set in the display grotesk in the restrained iris
 * accent. (Kept the name/`animate` prop for call-site compatibility — no gradients.)
 */
export function GradientText({
  children,
  className,
  animate: _animate = false,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span className={cn("font-display text-accent", className)}>
      {children}
    </span>
  );
}
