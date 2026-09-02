/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        retro: {
          dark: '#121019',
          card: '#1e1a29',
          panel: '#282238',
          border: '#3c3452',
          primary: '#ff3366',
          purple: '#9933ff',
          cyan: '#00f0ff',
          yellow: '#ffcc00',
          green: '#00ff66',
        },
      },
      fontFamily: {
        arcade: ['"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};
