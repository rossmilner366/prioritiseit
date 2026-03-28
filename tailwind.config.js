/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EDF8FC',
          100: '#D5EFF8',
          200: '#A8DEF1',
          300: '#6DC8E6',
          400: '#2596BE',
          500: '#1E7DA0',
          600: '#176482',
          700: '#124C63',
          800: '#0C3445',
          900: '#071D27',
        },
        slate: {
          850: '#161B2E',
          950: '#0B0F1A',
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
