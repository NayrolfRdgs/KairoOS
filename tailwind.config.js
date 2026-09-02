/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: "#090a0f",
          surface: "#12141e",
          card: "#181a28",
          border: "#262b40",
          accent: "#00f0ff",
          neon: "#ff0055",
          gold: "#ffb703",
          success: "#00f59b",
          text: "#f0f2f8",
          muted: "#8a94a6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arcade: ['Press Start 2P', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
