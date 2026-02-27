/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'palmo-yellow': '#FFD700',
        'palmo-black': '#1A1A1A',
      },
      backgroundColor: {
        'palmo-yellow': '#FFD700',
        'palmo-black': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
