import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}", 
    "./src/components/shared/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        coffee: {

          primary: "#EE8A2F",   //
      
          dark: "#251F1F",      //

          soft: "#FDF8F5",      //

          white: "#FFFFFF",     //
        }
      },
    
      height: {
        "112.5": "28.125rem", 
      }
    },
  },
  plugins: [], 
};

export default config;