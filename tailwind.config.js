/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: "#f4f6f9",
          sidebar: "#ffffff",
          card: "#ffffff",
          cardHover: "#fafbfc",
          border: "#e2e6ef",
          borderStrong: "#cbd3e1",
          primary: "#ff3366",      // Rose fluo arcade 80s
          cyan: "#00b4d8",         // Cyan 80s
          yellow: "#ffaa00",       // Jaune soleil 80s
          purple: "#7928ca",       // Violet rétro
          teal: "#00b894",         // Vert menthe arcade
          text: "#192a56",         // Bleu-nuit très foncé pour contraste parfait
          textMuted: "#636e72",
          textLight: "#a4b0be",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arcade: ['Press Start 2P', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'retro': '0 4px 14px 0 rgba(0, 0, 0, 0.06)',
        'retro-md': '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'retro-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.12)',
        'retro-neon': '0 0 20px rgba(255, 51, 102, 0.25)',
        'retro-cyan': '0 0 20px rgba(0, 180, 216, 0.25)',
      }
    },
  },
  plugins: [],
}
