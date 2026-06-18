import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-line-grid bg-lines opacity-[0.5]" />

      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl animate-blob" />
      <div
        className="absolute right-0 top-10 h-[28rem] w-[28rem] rounded-full bg-cyan-300/35 blur-3xl animate-blob"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl animate-blob"
        style={{ animationDelay: "-12s" }}
      />

      <div className="absolute inset-0 noise opacity-[0.035]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-50" />
    </div>
  );
}
