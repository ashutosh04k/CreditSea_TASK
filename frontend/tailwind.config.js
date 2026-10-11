/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#234FE6',
          50: '#eef4ff',
          100: '#dbe7fe',
          200: '#bfd5fe',
          300: '#93bbfd',
          400: '#5f96f9',
          500: '#234fe6',
          600: '#1b3fb8',
          700: '#163293',
          800: '#142976',
          900: '#152562',
        },
        brand: {
          DEFAULT: '#234FE6',
          50: '#eef4ff',
          100: '#dbe7fe',
          400: '#5f96f9',
          500: '#234fe6',
          600: '#1b3fb8',
          700: '#163293',
          800: '#142976',
          900: '#152562',
        },
        credflow: {
          blue: '#234FE6',
          dark: '#16369A',
          navy: '#0E2368',
          light: '#EEF4FF',
          ice: '#F8FAFC',
        },
        whatsapp: '#25D366',
        secondary: '#ffffff',
        accent: {
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          indigo: '#234FE6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'credflow': '0 20px 45px -12px rgba(35, 79, 230, 0.2)',
        'credflow-card': '0 12px 36px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 25px rgba(35, 79, 230, 0.4)',
      }
    },
  },
  plugins: [],
};
