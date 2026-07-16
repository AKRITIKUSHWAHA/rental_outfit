/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefdf6',
          100: '#fdfbe7',
          200: '#faf4c2',
          300: '#f5ea92',
          400: '#edda58',
          500: '#d4af37', // Brand Gold
          600: '#b88d23',
          700: '#996e1a',
          800: '#7d5517',
          900: '#674415',
        },
        maroon: {
          50: '#fdf3f5',
          100: '#fbe7ea',
          200: '#f7c3cb',
          300: '#f092a1',
          400: '#e55a73',
          500: '#800020', // Brand Maroon
          600: '#6c0019',
          700: '#5a0014',
          800: '#4c0011',
          900: '#41000f',
        },
        cream: {
          50: '#fdfcf7',
          100: '#fcfaf2', // Warm Cream Light
          200: '#f7f3e3',
          300: '#ebdca9',
          400: '#e1c379',
          500: '#d0a54e',
          600: '#be8c3b',
          700: '#9e6d2e',
          800: '#805427',
          900: '#694421',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
