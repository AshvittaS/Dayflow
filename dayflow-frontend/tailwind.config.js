/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0d0d10',
          panel: '#16161b',
          card: '#1c1c22',
          border: '#2a2a32'
        },
        accent: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed'
        },
        status: {
          present: '#22c55e',
          absent: '#eab308',
          leave: '#f87171'
        }
      }
    }
  },
  plugins: []
}
