/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Digdir Core Palette approximation
        primary: {
          50: '#E6EFF8',
          100: '#CDDFF1',
          200: '#9BC0E3',
          300: '#68A0D5',
          400: '#3681C8',
          500: '#0062BA', // Main Brand Color
          600: '#004E95',
          700: '#003A70',
          800: '#00264A',
          900: '#001225',
        },
        neutral: {
          50: '#F4F5F6',
          100: '#E9EAEC',
          200: '#D3D6D9',
          300: '#BCC1C6',
          400: '#A6ACB3',
          500: '#8F979F',
          600: '#79828C',
          700: '#626D78',
          800: '#4B5865',
          900: '#1E2B3C', // Dark text
        },
        // Semantic colors
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#065F46',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        danger: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#991B1B',
        }
      },
      boxShadow: {
        'digdir': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'digdir-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'digdir': '4px', // Digdir often uses smaller radii or 4px
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}