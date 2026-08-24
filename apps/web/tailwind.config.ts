import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        sakura: "rgb(var(--color-sakura) / <alpha-value>)",
        matcha: "rgb(var(--color-matcha) / <alpha-value>)",
        washi: "rgb(var(--color-washi) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
