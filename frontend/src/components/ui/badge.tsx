import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "mono inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-accent/25 bg-accent/10 text-accent",
        neutral: "border-hairline bg-white/[0.04] text-ink-muted",
        easy: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        medium: "border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan",
        hard: "border-warn/30 bg-warn/10 text-warn",
        cyan: "border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan",
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
