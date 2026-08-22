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
          bg: '#0d0d10',
          panel: '#16161b',
          card: '#1e1e26',
          border: '#2a2a35',
          hover: '#252530',
          surface: '#16161b'
        },
        accent: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: '#a78bfa',
          subtle: '#8b5cf615',
          border: '#8b5cf635',
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
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        cardHover: '0 12px 24px -6px rgba(139, 92, 246, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.05)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
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
