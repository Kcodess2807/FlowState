import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "rounded-full border border-hairline bg-surface object-cover",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
