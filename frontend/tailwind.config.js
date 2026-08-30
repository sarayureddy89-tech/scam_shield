/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070E1F",
          900: "#0B1730",
          800: "#122145",
          700: "#1B2F5C",
          600: "#28407A",
        },
        indigo: {
          500: "#4C5FD5",
          400: "#6C7DE0",
        },
        safe: {
          600: "#0E9F6E",
          500: "#12B981",
          100: "#DEF7EC",
        },
        risk: {
          700: "#B91C1C",
          600: "#DC2626",
          500: "#EF4444",
          100: "#FEE2E2",
        },
        warn: {
          600: "#C2760C",
          500: "#E08E0B",
          100: "#FEF3C7",
        },
        paper: "#F6F7FB",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,23,48,0.06), 0 8px 24px -8px rgba(11,23,48,0.12)",
      },
      keyframes: {
        gaugeFill: {
          "0%": { strokeDashoffset: "var(--gauge-start)" },
          "100%": { strokeDashoffset: "var(--gauge-end)" },
        },
        riseIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        gauge: "gaugeFill 1.1s cubic-bezier(.22,1,.36,1) forwards",
        riseIn: "riseIn .5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
