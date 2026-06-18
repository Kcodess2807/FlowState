import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
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
        lift: "0 10px 30px -12px rgba(13, 148, 136, 0.25)",
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        glow: "0 0 0 1px rgba(13,148,136,0.12), 0 8px 30px -8px rgba(13,148,136,0.35)",
        "glow-cyan": "0 10px 40px -10px rgba(34,211,238,0.45)",
        float: "0 24px 60px -18px rgba(15, 23, 42, 0.22)",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)",
        "line-grid":
          "linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(135deg, #0d9488 0%, #14b8a6 45%, #22d3ee 100%)",
        "brand-sheen":
          "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%)",
      },
      backgroundSize: {
        dots: "22px 22px",
        lines: "40px 40px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        draw: {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-16px) translateX(8px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(24px,-30px) scale(1.08)" },
          "66%": { transform: "translate(-20px,20px) scale(0.94)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        dash: {
          to: { strokeDashoffset: "-32" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "soft-pulse": "soft-pulse 2s ease-in-out infinite",
        draw: "draw 1.2s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        blob: "blob 18s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s ease infinite",
        marquee: "marquee 28s linear infinite",
        dash: "dash 1s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
