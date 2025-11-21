/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primario: "var(--primario)",
        secundario: "var(--secundario)",
        terciario: "var(--terciario)",
      },
    },
  },
  plugins: [],
};

