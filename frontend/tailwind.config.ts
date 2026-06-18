import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        // Dark, blueprint-in-the-dark palette.
        bg: "#0A0C10",
        elevated: "#12151B",
        surface: "#161A22",
        hairline: "rgba(255,255,255,0.08)",
        "hairline-strong": "rgba(255,255,255,0.14)",
        ink: {
          DEFAULT: "#EDEFF3",
          muted: "#9BA3B4",
          faint: "#5B6373",
        },
        accent: {
          DEFAULT: "#2DD4BF",
          cyan: "#38BDF8",
          glow: "rgba(45,212,191,0.35)",
        },
        warn: "#F4A338",
        // Kept teal scale for fine-grained accent shades.
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(45,212,191,0.18), 0 8px 40px -8px rgba(45,212,191,0.35)",
        "glow-sm": "0 0 24px -6px rgba(45,212,191,0.45)",
        hairline: "0 0 0 1px rgba(255,255,255,0.08)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
        "line-grid":
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "accent-glow":
          "radial-gradient(50% 50% at 50% 50%, rgba(45,212,191,0.22) 0%, transparent 70%)",
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
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
        draw: "draw 1.2s ease-out forwards",
        dash: "dash 1s linear infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
