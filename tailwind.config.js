/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f5f2e9",
        ink: "#183e3b",
        coral: "#e77d5c",
        sage: "#dce7dc",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
