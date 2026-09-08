/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0b0f19',
          card: '#131b2e',
          accent: '#00f0ff',
          neonPink: '#ff007f',
          neonGold: '#ffd700',
          neonGreen: '#39ff14',
          neonRed: '#ff3131',
        }
      },
      fontFamily: {
        game: ['"Press Start 2P"', 'monospace', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px) translateY(4px)' },
          '40%, 80%': { transform: 'translateX(8px) translateY(-4px)' },
        },
        floatDamage: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '1', transform: 'translateY(-30px) scale(1.3)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1)' },
        },
        slash: {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-45deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(-15deg)' },
          '100%': { opacity: '0', transform: 'scale(1.5) rotate(0deg)' },
        },
        flashRed: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)' },
          '50%': { boxShadow: '0 0 30px rgba(147, 51, 234, 0.9)' },
        }
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        floatDamage: 'floatDamage 0.8s ease-out forwards',
        slash: 'slash 0.5s ease-out forwards',
        flashRed: 'flashRed 0.4s ease-in-out',
        pulseGlow: 'pulseGlow 2s infinite',
      }
    },
  },
  plugins: [],
}
