import { cn } from "@/lib/utils";

interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dots" | "lines";
}

export function DotGrid({
  children,
  variant = "dots",
  className,
  ...props
}: DotGridProps) {
  return (
    <div
      className={cn(
        variant === "dots" ? "surface-dots" : "surface-lines",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
