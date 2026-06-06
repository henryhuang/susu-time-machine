import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        peach: {
          50: "#fff4f1",
          100: "#f9d8d2",
          500: "#ef6f5e",
          600: "#d95b4b"
        },
        susu: {
          bg: "#f8f6f1",
          text: "#211f1c",
          muted: "#6f6b64",
          line: "#dedbd4",
          blue: "#7db7e8",
          green: "#7bcfa6",
          orange: "#f3a85c",
          red: "#e76f7a"
        }
      },
      boxShadow: {
        card: "0 18px 50px rgba(32, 29, 24, 0.08)",
        soft: "0 8px 24px rgba(32, 29, 24, 0.06)",
        popover: "0 20px 60px rgba(32, 29, 24, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
