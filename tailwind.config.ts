import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          layout: {
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "1px",
            },
            radius: {
              small: "0.5rem", // 8px
              medium: "0.75rem", // 12px
              large: "1rem", // 16px
            },
          },
          colors: {
            primary: {
              DEFAULT: "#0070f3",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#7928ca",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          layout: {
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "1px",
            },
            radius: {
              small: "0.2rem", // 8px
              medium: "0.45rem", // 12px
              large: "0.45rem", // 16px
            },
          },
          colors: {
            primary: {
              DEFAULT: "#d0f500",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#7928ca",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};

export default config;
