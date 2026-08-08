/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A0E17",
          900: "#0F1522",
          800: "#161D2E",
          700: "#1F2A3F",
          600: "#2A374F",
        },
        water: {
          400: "#5EC8F2",
          500: "#2FA8E0",
          600: "#1C86C4",
          700: "#146699",
        },
        risk: {
          low: "#2ECC71",
          moderate: "#F1C40F",
          high: "#F39C12",
          critical: "#E74C3C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
