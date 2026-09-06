import type { Config } from "tailwindcss";

/**
 * Kaun Banega College Pati — Design Token System
 *
 * Color palette: Deep navy/void backgrounds, warm gold accents, ink-white text.
 * Inspired by premium television game-show aesthetics — NOT generic KBC.
 * Never use cream/beige backgrounds, neon cyberpunk, flat corporate primaries,
 * or heavy glassmorphism. See Architecture.md §6.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "void": "#05070D",
        "navy": "#0B0F1F",
        "navy-light": "#141B34",
        "gold": "#E8C86B",
        "gold-bright": "#FFE9A8",
        "gold-deep": "#B4903B",
        "ink-white": "#F6F1E4",
        "blue-glow": "#3A5AFF",
        "success": "#3DDC84",
        "success-glow": "#8CFFC1",
        "danger": "#E85B5B",
        "danger-glow": "#FF9B9B",
        "neutral-line": "#2A3352",
      },
      fontFamily: {
        title: ["var(--font-cinzel)", "var(--font-playfair)", "serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        mono: ["var(--font-space-grotesk)", "monospace"],
      },
      animation: {
        "shimmer": "shimmer 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "sweep": "sweep 4s ease-in-out infinite",
        "shake": "shake 0.15s ease-in-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "slide-left": "slide-left 0.6s ease-out forwards",
        "slide-right": "slide-right 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "particle-drift": "particle-drift 8s linear infinite",
        "spotlight": "spotlight 12s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "-200% center" },
          "50%": { backgroundPosition: "200% center" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sweep: {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "particle-drift": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-10vh) rotate(720deg)", opacity: "0" },
        },
        spotlight: {
          "0%": { transform: "translateX(-100%) rotate(-15deg)" },
          "50%": { transform: "translateX(100%) rotate(15deg)" },
          "100%": { transform: "translateX(-100%) rotate(-15deg)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #B4903B, #E8C86B, #FFE9A8, #E8C86B, #B4903B)",
        "gold-shimmer": "linear-gradient(90deg, transparent, #FFE9A8, transparent)",
        "navy-gradient": "linear-gradient(180deg, #0B0F1F, #05070D)",
        "radial-glow": "radial-gradient(circle, rgba(58, 90, 255, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "gold": "0 0 20px rgba(232, 200, 107, 0.3)",
        "gold-intense": "0 0 40px rgba(232, 200, 107, 0.5), 0 0 80px rgba(232, 200, 107, 0.2)",
        "blue-ambient": "0 0 60px rgba(58, 90, 255, 0.15)",
        "success": "0 0 30px rgba(61, 220, 132, 0.4)",
        "danger": "0 0 30px rgba(232, 91, 91, 0.4)",
        "inner-gold": "inset 0 0 30px rgba(232, 200, 107, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
