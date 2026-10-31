/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0C10',
        glass: '#141720',
        gold: '#D4AF37',
        goldLight: '#F3E5AB',
        kedr: '#1E4D3B',
        kedrLight: '#2E7359',
        violetMetal: '#3B1C32',
        roseMetal: '#6B2D5C',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
