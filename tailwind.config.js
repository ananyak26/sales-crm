/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1ff",
          100: "#e0e4ff",
          200: "#c7cdff",
          300: "#a5aeff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        ink: {
          50: "#f4f5f7",
          100: "#e7e9ee",
          200: "#c8cdd8",
          300: "#9aa3b6",
          400: "#6b768f",
          500: "#4b5470",
          600: "#363e57",
          700: "#262c40",
          800: "#181c2b",
          900: "#101321",
          950: "#0a0c16",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,19,33,0.04), 0 8px 24px -8px rgba(16,19,33,0.10)",
        premium: "0 2px 6px rgba(16,19,33,0.06), 0 16px 40px -12px rgba(16,19,33,0.16)",
        glow: "0 0 0 4px rgba(99,102,241,0.12)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #4338ca 100%)",
        "ink-gradient": "linear-gradient(180deg, #12151f 0%, #0a0c16 100%)",
      },
    },
  },
  plugins: [],
};
