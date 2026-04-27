import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f6f3ee",
        paper: "#fffdf8",
        ink: "#1f2933",
        mist: "#dbe8e5",
        teal: {
          DEFAULT: "#2f6f68",
          dark: "#245752",
        },
        clay: {
          DEFAULT: "#a65f43",
          dark: "#854c35",
        },
        gold: {
          DEFAULT: "#c6943f",
          light: "#d8ab58",
          dark: "#926d2e",
        },
        orange: {
          DEFAULT: "#df7907",
          dark: "#c86903",
          soft: "#f6eadc",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
