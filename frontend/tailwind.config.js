module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        coral: {
          50: '#fff0ed',
          100: '#ffe0d9',
          200: '#ffc1b2',
          300: '#ff967e',
          400: '#ff5722', // Primary
          500: '#f5410a',
          600: '#ce2e03',
          700: '#aa2605',
          800: '#87230b',
          900: '#6d210e',
        },
        dark: {
          bg: '#0f0f11',
          card: '#18181b',
          border: '#27272a'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    } 
  },
  plugins: [],
};
