/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dae5',
          300: '#aab9cd',
          400: '#7c93b0',
          500: '#5b7396',
          600: '#485b7c',
          700: '#3b4a65',
          800: '#344055',
          900: '#2e3849',
        },
      },
    },
  },
  plugins: [],
}