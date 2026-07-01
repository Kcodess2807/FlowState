import type { Config } from "tailwindcss";

/**
 * Color tokens resolve to CSS variables that hold space-separated RGB triples
 * (e.g. `--ink: 32 28 22`). Wrapping them in `rgb(... / <alpha-value>)` keeps
 * Tailwind opacity modifiers (e.g. `bg-accent/10`, `text-ink-muted`) working
 * while letting `.dark` swap the whole palette by redefining the variables.
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Nocturne: architectural grotesk display, clean sans body, plex mono.
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        bg: withAlpha("--bg"),
        elevated: withAlpha("--elevated"),
        surface: withAlpha("--surface"),
        hairline: "rgb(var(--ink) / 0.10)",
        "hairline-strong": "rgb(var(--ink) / 0.18)",
        ink: {
          DEFAULT: withAlpha("--ink"),
          muted: withAlpha("--ink-muted"),
          faint: withAlpha("--ink-faint"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          soft: withAlpha("--accent-soft"),
          contrast: withAlpha("--accent-contrast"),
        },
        warn: withAlpha("--warn"),
      },
      boxShadow: {
        // Soft, low, paper-like shadows — no glow.
        card: "0 1px 2px rgb(var(--shadow) / 0.05), 0 1px 1px rgb(var(--shadow) / 0.04)",
        "card-lg":
          "0 1px 2px rgb(var(--shadow) / 0.04), 0 12px 28px -16px rgb(var(--shadow) / 0.22)",
        hairline: "0 0 0 1px rgb(var(--ink) / 0.10)",
        panel:
          "0 1px 0 0 rgb(var(--elevated) / 0.6) inset, 0 22px 48px -30px rgb(var(--shadow) / 0.30)",
        // Back-compat aliases for former glow names → now subtle, glow-free.
        glow: "0 1px 2px rgb(var(--shadow) / 0.05), 0 12px 28px -16px rgb(var(--shadow) / 0.22)",
        "glow-sm":
          "0 1px 2px rgb(var(--shadow) / 0.05), 0 1px 1px rgb(var(--shadow) / 0.04)",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, rgb(var(--ink) / 0.10) 1px, transparent 1px)",
        "line-grid":
          "linear-gradient(rgb(var(--ink) / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--ink) / 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        dots: "22px 22px",
        lines: "40px 40px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        draw: {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        dash: { to: { strokeDashoffset: "-32" } },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
        draw: "draw 1.2s ease-out forwards",
        dash: "dash 1s linear infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
