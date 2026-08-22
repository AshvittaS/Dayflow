/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#F8F9FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          panel: '#FFFFFF',
          border: '#EAEAEC',
          hover: '#F4F4F6'
        },
        text: {
          primary: '#1A1A1F',
          secondary: '#6B6B76',
          muted: '#92929D'
        },
        accent: {
          DEFAULT: '#5B4FE9',
          hover: '#4A3EC8',
          light: '#EEEDFC',
          subtle: '#5B4FE912',
          border: '#5B4FE930'
        },
        status: {
          present: '#10B981',
          absent: '#F59E0B',
          leave: '#64748B'
        }
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        cardHover: '0 12px 24px -6px rgba(91, 79, 233, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.03)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
      }
    }
  },
  plugins: []
}
