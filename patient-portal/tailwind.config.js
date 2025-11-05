/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Medical Theme - Titan V3
        'cyber-black': '#0a0a0a',
        'cyber-dark': '#1a1a1a',
        'cyber-gray': '#2a2a2a',
        'cyber-light': '#3a3a3a',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
        'neon-green': '#00ff00',
        'neon-blue': '#0080ff',
        'neon-purple': '#8000ff',
        'neon-red': '#ff0040',
        'neon-yellow': '#ffff00',
        'dental-blue': '#2563eb',
        'dental-green': '#10b981',
        'dental-purple': '#8b5cf6',
        'dental-pink': '#ec4899',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
        'neon-glow': 'linear-gradient(45deg, #00ffff, #ff00ff, #00ff00)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 0, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
}