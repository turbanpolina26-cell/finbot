/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        tg: {
          bg: 'var(--tg-bg)',
          card: 'var(--tg-card)',
          secondary: 'var(--tg-secondary)',
          text: 'var(--tg-text)',
          muted: 'var(--tg-muted)',
          accent: 'var(--tg-accent)',
          gold: 'var(--tg-gold)',
          red: '#ff5c5c',
          green: '#4cd964',
          profit: '#4cd964',
          loss: '#ff5c5c',
          neutral: '#8a92b2'
        }
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'micro': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'easeOutQuad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'easeInOutBack': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      borderRadius: {
        'card': '1.5rem',
        'modal': '1.875rem',
      },
      boxShadow: {
        'sm-soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'md-soft': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'lg-soft': '0 8px 24px rgba(0, 0, 0, 0.2)',
        'accent': 'var(--shadow-accent)',
      }
    }
  },
  plugins: [],
}
