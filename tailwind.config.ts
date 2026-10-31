import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f5ef",
        muted: "#77766f",
        gold: "#d7a928"
      },
      fontFamily: {
        display: ["Arial Black", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(23,23,23,.06)"
      }
    }
  },
  plugins: []
};

export default config;
