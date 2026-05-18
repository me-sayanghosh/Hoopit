module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        brand: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem'
      },
      colors: {
        brand: {
          DEFAULT: '#0066ff',
          dark: '#0052cc'
        }
      },
      keyframes: {
        underline: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        'underline-grow': 'underline 450ms ease-out forwards'
      }
    }
  },
  plugins: []
}
