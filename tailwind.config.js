/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1A42BA',
        primaryDark: '#122E85',
        sky: '#38BDF8',
        bg: '#F8F9FA',
        card: '#FFFFFF',
        orange: '#FF961D',
        green: '#10B981',
        red: '#EF4444',
        textDark: '#172031',
        textMuted: '#8A8D9F',
        chipBlue: '#E8F0FE',
      },
    },
  },
  plugins: [],
};