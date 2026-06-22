import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "mono inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-accent/30 bg-accent/10 text-accent",
        neutral: "border-hairline bg-surface text-ink-muted",
        easy: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
        medium: "border-accent/30 bg-accent/10 text-accent",
        hard: "border-rose-600/30 bg-rose-600/10 text-rose-700 dark:text-rose-300",
        cyan: "border-hairline bg-surface text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
