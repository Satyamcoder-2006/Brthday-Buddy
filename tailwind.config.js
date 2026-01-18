/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF9500',
        primaryLight: '#FFB347',
        background: '#000000',
        surface: '#111111',
        surfaceHighlight: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textDisabled: '#999999',
        border: '#444444',
      },
    },
  },
  plugins: [],
}
