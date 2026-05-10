import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
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
    forms,
  ],
};
