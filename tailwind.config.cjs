/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        banner: {
          "0%": { transform: "translateX (0)" },
          "100%": { transform: "translateX(-180%)" },
        },
      },
      animation: {
        banner: "banner 15s alternate ease-in-out infinite",
      },
    },
  },
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  //plugins: [require("flowbite/plugin")],
};
