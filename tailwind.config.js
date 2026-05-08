/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✨ NEW PREMIUM PALETTE
        accent: {
          pink: '#F26B8A',
          mint: '#5FA89B',
          mustard: '#F2B544',
          'pink-dark': '#C94F6D',
          'yellow-dark': '#D9A63C',
        },
        brand: {
          cream: '#F7F3E8',
          dark: '#121212',
          'green-glass': '#1F4D46',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backdropBlur: {
        'premium': '40px',
      }
    },
  },
  plugins: [],
}
