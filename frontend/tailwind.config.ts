import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0d14",
        surface: "#111827",
        "surface-raised": "#1e293b",
        "surface-card": "#0f172a",
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
        },
        gamify: {
          streak: "#ff9600",
          xp: "#58cc02",
          freeze: "#1cb0f6",
          heart: "#ff4b4b",
          gold: "#ffd900",
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "bounce-slight": "bounceSlight 1s infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(99, 102, 241, 0.6))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 5px rgba(99, 102, 241, 0.2))" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        bounceSlight: {
          "0%, 100%": { transform: "translateY(-3%)" },
          "50%": { transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
