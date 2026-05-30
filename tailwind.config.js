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
          DEFAULT: '#007AFF',
        },
        background: {
          DEFAULT: '#F2F2F7',
        },
        surface: {
          DEFAULT: '#E9E9EB',
        },
        text: {
          primary: '#000000',
          secondary: '#8E8E93',
        },
        border: {
          DEFAULT: '#C6C6C8',
        }
      },
      borderRadius: {
        'bubble': '18px',
      }
    },
  },
  plugins: [],
}
