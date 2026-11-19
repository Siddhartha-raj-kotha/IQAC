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
        // Kakatiya University Official Colors
        ku: {
          navy: "#002147",
          navyDark: "#001A33",
          navyLight: "#003366",
          blue: "#337ab7",
          blueLight: "#4a90d9",
          gold: "#FFD700",
          goldDark: "#D4A800",
          goldLight: "#FFF0A0",
          green: "#008000",
          greenLight: "#E8F5E9",
          red: "#A52A2A",
          white: "#FFFFFF",
          gray: "#333333",
          grayLight: "#F5F7FA",
          grayMid: "#E8ECF0",
          border: "#D0D8E4",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "Arial", "Helvetica", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        telugu: ["Noto Sans Telugu", "sans-serif"],
      },
      fontSize: {
        // Larger base sizes for elderly users
        base: ["17px", { lineHeight: "1.7" }],
        lg: ["19px", { lineHeight: "1.7" }],
        xl: ["21px", { lineHeight: "1.6" }],
        "2xl": ["24px", { lineHeight: "1.5" }],
        "3xl": ["30px", { lineHeight: "1.4" }],
        "4xl": ["36px", { lineHeight: "1.3" }],
      },
      spacing: {
        // Generous spacing for touch targets
        "touch": "48px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,33,71,0.10)",
        cardHover: "0 4px 16px rgba(0,33,71,0.18)",
        header: "0 2px 12px rgba(0,33,71,0.20)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
