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
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        cyber: ['Orbitron', 'sans-serif'],
        tech: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'hud': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-flow': 'shimmerFlow 3s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'float-hud': 'floatHud 6s ease-in-out infinite',
        'stream-particle': 'streamParticle 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.4))' },
          '50%': { opacity: '0.65', transform: 'scale(0.98)', filter: 'drop-shadow(0 0 2px rgba(6,182,212,0.1))' },
        },
        shimmerFlow: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatHud: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        streamParticle: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '30%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateX(300%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
