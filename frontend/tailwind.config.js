/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
  "./src/**/*.{js,ts,jsx,tsx,css}",],
    theme: {
      extend: {
        colors: {
        marble: '#F2EDEB', // Marble White
        desert: '#ECCB98', // Desert Yellow
        sunset: '#E85D4E', // Sunset Reds
        deepBrown: '#4E3129', // Deep Browns
        deepGreen: '#006b38', // Deep Green
      },
    },
  },
  plugins: [require('daisyui')],
}