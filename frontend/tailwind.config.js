/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a',
          900: '#1e293b',
          850: '#334155',
          800: '#475569',
        },
        primary: {
          DEFAULT: '#0891b2',
          light: '#22d3ee',
          dark: '#0e7490',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
        },
        background: {
          DEFAULT: '#0f172a',
          paper: '#1e293b',
        },
        glass: {
          DEFAULT: 'rgba(30, 41, 59, 0.75)',
          border: 'rgba(148, 163, 184, 0.2)',
        },
        profit: '#10b981',
        loss: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.4)',
        'card': '0 4px 24px -2px rgba(15, 23, 42, 0.3)',
        'glow': '0 0 20px rgba(8, 145, 178, 0.3)',
      },
      backdropBlur: {
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
