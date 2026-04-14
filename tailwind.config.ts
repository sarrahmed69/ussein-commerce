import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./screens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2d5a1b",
          dark: "#1a3d10",
          light: "#4a7c2f",
          50: "#f0f8e8",
          100: "#e0f0d0",
          200: "#a8d080",
          700: "#2d5a1b",
          900: "#1a3d10",
        },
        accent: {
          DEFAULT: "#d4a017",
          light: "#f0c84b",
        },
        background: "#f8faf5",
      },
      fontFamily: {
        body: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;