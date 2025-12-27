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
          DEFAULT: '#0f172a', // Deep Blue/Navy (Slate 900)
          light: '#1e293b',   // Slate 800
        },
        secondary: {
          DEFAULT: '#10b981', // Teal/Green (Emerald 500)
          dark: '#059669',    // Emerald 600
        },
        neutral: {
          light: '#f8fafc',   // Slate 50
          dark: '#334155',    // Slate 700
        },
        profit: '#10b981',    // Green
        loss: '#ef4444',      // Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
