import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
}: {
  className?: string;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900",
        className,
      )}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-glow transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="7" height="5" rx="1.5" stroke="white" strokeWidth="1.8" />
          <rect x="14" y="15" width="7" height="5" rx="1.5" stroke="white" strokeWidth="1.8" />
          <path
            d="M6.5 9.5C6.5 13 10 12.5 12 14.5C13 15.5 14 16.5 14 17"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="1 3"
          />
        </svg>
      </span>
      <span>
        Flow<span className="text-gradient">State</span>
      </span>
    </Link>
  );
}
