import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        bgMain: "var(--bg-main)",
        bgCard1: "var(--bg-card1)",
        bgCard2: "var(--bg-card2)",
        borderMain: "var(--border-main)",
        fontMain: "var(--font-main)",
      },
      fontFamily: {
        aeonik: ['"Aeonik"'],
      },
    },
  },
  plugins: [],
} satisfies Config;
