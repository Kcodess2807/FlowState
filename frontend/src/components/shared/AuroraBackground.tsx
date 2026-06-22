import { cn } from "@/lib/utils";

/**
 * Editorial backdrop: a faint engineering grid with a subtle paper grain.
 * No gradients or glowing blobs — just quiet texture behind content.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="noise absolute inset-0 opacity-[0.03]" />
    </div>
  );
}
