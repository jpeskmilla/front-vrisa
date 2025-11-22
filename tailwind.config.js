/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primario: "var(--primario)",
        secundario: "var(--secundario)",
        terciario: "var(--terciario)",
        "brand-500": "#4F46E5",
        "muted-100": "#F3F4F6",
      },
    },
  },
  plugins: [],
};
