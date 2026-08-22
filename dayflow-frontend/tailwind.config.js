/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        base: {
          bg: '#0b0c10',
          panel: '#12141a',
          card: '#181a22',
          border: '#262a36',
        },
        accent: {
          DEFAULT: '#ff6b4a',
          hover: '#f55733',
          amber: '#f59e0b',
        },
        brand: {
          dark: '#0b0c10',
          surface: '#12141a',
          card: '#181a22',
          border: '#262a36',
          borderLight: '#353b4b',
          amber: '#ff6b4a',
          solar: '#f59e0b',
          sage: '#10b981',
          coral: '#f43f5e',
          text: '#f8fafc',
          muted: '#8e95a5',
        },
        status: {
          present: '#10b981',
          absent: '#f59e0b',
          leave: '#f43f5e',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cadence-beat': 'cadenceBeat 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        cadenceBeat: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
