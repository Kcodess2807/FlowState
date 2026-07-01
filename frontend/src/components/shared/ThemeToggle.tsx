import { Moon02Icon, Sun03Icon } from "hugeicons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

/** Light/dark switch with a soft crossfade between sun and moon. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun03Icon size={18} /> : <Moon02Icon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
