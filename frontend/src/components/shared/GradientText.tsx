import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
  animate = false,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      className={cn("text-gradient", animate && "animate-gradient-pan", className)}
    >
      {children}
    </span>
  );
}
