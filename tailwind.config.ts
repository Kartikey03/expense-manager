import type { Config } from "tailwindcss";

// Apple dark-mode palette: true black canvas, iOS system grays for surfaces,
// iOS dark "system colors" for data, and Kiwi green as the brand accent.
// No gradients anywhere.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          "var(--font-inter)",
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        canvas: "#000000",
        surface: {
          DEFAULT: "#1c1c1e",
          2: "#2c2c2e",
          3: "#3a3a3c",
        },
        label: {
          DEFAULT: "#f5f5f7",
          2: "#a1a1a6",
          3: "#6e6e73",
        },
        hairline: "rgba(255,255,255,0.08)",
        // Kiwi brand green, sampled from the app icon's leaf.
        // Dark text on it (8.8:1); lighter tint for links/active states (12:1 on black).
        accent: {
          DEFAULT: "#7ccc6a",
          hover: "#8ad677",
          link: "#8fd67a",
          ink: "#06200f",
        },
        sys: {
          blue: "#0a84ff",
          green: "#30d158",
          red: "#ff453a",
          orange: "#ff9f0a",
          yellow: "#ffd60a",
          indigo: "#5e5ce6",
          purple: "#bf5af2",
          pink: "#ff375f",
          teal: "#40c8e0",
          cyan: "#64d2ff",
          mint: "#63e6e2",
          brown: "#ac8e68",
          gray: "#8e8e93",
        },
      },
      borderRadius: {
        tile: "18px",
      },
      transitionTimingFunction: {
        // iOS sheet / spring-ish curve
        ios: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
