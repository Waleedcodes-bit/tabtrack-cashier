module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-dark':  '#080d17',
        'brand-card':  '#0d1321',
        'brand-green': '#10b981',
        'brand-teal':  '#144d5d',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.7)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        progress: {
          from: { width: '0%' },
          to:   { width: '100%' },
        },
      },
      animation: {
        'scale-in':   'scaleIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.25s ease-out',
        'progress':   'progress 0.3s ease-out',
        'fade-in':    'fadeInUp 0.2s ease-out',
        'spin-slow':  'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};