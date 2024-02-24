/** @type {import('tailwindcss').Config} */
export default {
  content: [],
    theme: {
      extend: {
        colors: {
        marble: '#F2EDEB', // Marble White
        desert: '#ECCB98', // Desert Yellow
        sunset: '#E85D4E', // Sunset Reds
        deepBrown: '#4E3129', // Deep Browns
        spinach: '#577F4E', // Spinach Green
      },
    },
  },
  plugins: [require('daisyui')],
}