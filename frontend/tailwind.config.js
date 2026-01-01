/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#082341', // Deep Navy
          light: '#0f2d52',
          dark: '#05162b',
        },
        secondary: {
          DEFAULT: '#305d69', // Teal/Slate
          light: '#3d7482',
          dark: '#244750',
        },
        accent: {
          DEFAULT: '#5c9484', // Sage Green
          light: '#73a99a',
        },
        background: {
          DEFAULT: '#ebfbf3', // Mint White
          paper: '#ffffff',
        },
        neutral: {
          DEFAULT: '#b8d0cc', // Grayish Cyan
          dark: '#344460',    // Dark Slate Blue (Text)
          light: '#f1f5f9',
        },
        profit: '#10b981',
        loss: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(8, 35, 65, 0.05)',
        'card': '0 0 0 1px rgba(8, 35, 65, 0.03), 0 2px 8px rgba(8, 35, 65, 0.04)',
      }
    },
  },
  plugins: [],
}
