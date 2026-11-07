/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces Variable', 'serif'],
        sans: ['DM Sans Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Token-driven colors mapped from CSS variables
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--c-ink-subtle) / <alpha-value>)',
        jade: {
          50: '#E8F6F1', 100: '#C8EBDF', 200: '#9ADBC5', 300: '#62C3A6',
          400: '#32A886', 500: '#1A8F70', 600: '#0E7C66', 700: '#0B6453',
          800: '#0A5043', 900: '#073B32',
        },
        gold: {
          50: '#FFF8E6', 100: '#FFEDBF', 300: '#FAD36E', 400: '#F7C348',
          500: '#F5B83D', 600: '#D99A1C', 700: '#A87310',
        },
        success: '#168A4A',
        warning: '#C77700',
        danger: '#C93A3A',
        info: '#2563A8',
        coral: '#E8625A',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 27 23 / .06), 0 8px 24px -8px rgb(11 27 23 / .12)',
        lift: '0 2px 4px rgb(11 27 23 / .08), 0 16px 32px -10px rgb(11 27 23 / .18)',
      },
      fontSize: {
        display: ['clamp(40px, 6vw, 64px)', { lineHeight: '1.05' }],
      },
      maxWidth: {
        content: '1280px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'ring-fill': {
          from: { 'stroke-dashoffset': 'var(--ring-circumference)' },
          to: { 'stroke-dashoffset': 'var(--ring-offset)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'count-up': 'count-up 0.4s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
