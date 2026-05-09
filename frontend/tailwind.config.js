/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ufscar: {
          orange:       '#F26522',
          'orange-dark':'#E05A15',
          navy:         '#071D41',
          'navy-light': '#0D2B5E',
          50:           '#FEF3EC',
          100:          '#FDE0C8',
        },
      },
    },
  },
  plugins: [],
};
