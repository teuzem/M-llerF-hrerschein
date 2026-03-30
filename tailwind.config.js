const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'german-black': '#000000',
        'german-red': '#DD0000',
        'german-gold': '#FFCE00',
        'permis-blue': '#0055A4',
        'permis-white': '#FFFFFF',
        'permis-red': '#EF4135',
      },
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
