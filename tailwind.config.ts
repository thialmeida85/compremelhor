import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#111111",
          graphite: "#1E1E1E",
          gold: "#FFC400",
          orange: "#FF6A00",
          offwhite: "#FFF8E6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
