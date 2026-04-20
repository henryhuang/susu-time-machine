import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        peach: {
          50: "#fff5f7",
          100: "#fde8ee",
          500: "#f28ba8",
          600: "#e57494"
        },
        susu: {
          bg: "#fff8fa",
          text: "#2f2a2a",
          muted: "#7a6f6f",
          line: "#ede6e3",
          blue: "#7db7e8",
          green: "#7bcfa6",
          orange: "#f3a85c",
          red: "#e76f7a"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(74, 52, 52, 0.06)",
        soft: "0 4px 12px rgba(74, 52, 52, 0.05)",
        popover: "0 12px 32px rgba(74, 52, 52, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
