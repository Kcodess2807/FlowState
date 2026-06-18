import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand-100 bg-brand-50 text-brand-800",
        neutral: "border-slate-200 bg-slate-50 text-slate-600",
        easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        hard: "border-rose-200 bg-rose-50 text-rose-700",
        cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
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
