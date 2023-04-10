/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/**/*.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["dracula"]
  }
};
