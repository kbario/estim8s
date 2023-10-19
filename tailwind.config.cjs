/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  daisyui:{
    themes: ["dracula"]
  },
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")],
};
