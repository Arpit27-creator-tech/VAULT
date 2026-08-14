/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Rajdhani"', '"Chakra Petch"', 'system-ui', 'sans-serif'],
        game: ['"Chakra Petch"', '"Rajdhani"', 'sans-serif'],
        display: ['"Orbitron"', '"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        ink: '#03140C',
        forestDark: '#051811',
        forestDeep: '#071E14',
        forestCard: '#0A261B',
        forestEmerald: '#10B981',
        forestMint: '#34D399',
        sunGold: '#FBBF24',
        sunAmber: '#F59E0B',
        flowerCoral: '#FF4D6D',
        flowerCyan: '#06B6D4',
        woodOak: '#78350F'
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #020C07',
        'neo': '3px 3px 0px #020C07',
        'neo-md': '4px 4px 0px #020C07',
        'neo-lg': '6px 6px 0px #020C07',
        'neo-xl': '8px 8px 0px #020C07',
        'neo-emerald': '4px 4px 0px #10B981',
        'neo-gold': '4px 4px 0px #FBBF24',
        'neo-coral': '4px 4px 0px #FF4D6D'
      }
    },
  },
  plugins: [],
}
