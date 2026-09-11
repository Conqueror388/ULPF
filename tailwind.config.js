/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b1326',
        surface: {
          DEFAULT: '#0f172a',
          low: '#131b2e',
          card: '#171f33',
          high: '#222a3d',
          highest: '#2d3449',
          border: '#334155'
        },
        primary: {
          DEFAULT: '#06b6d4',
          light: '#4cd7f6',
          dark: '#0891b2',
          glow: 'rgba(6, 182, 212, 0.25)'
        },
        accent: {
          green: '#22c55e',
          neonGreen: '#4ae176',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
