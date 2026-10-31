/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#1e3328',
        glass: '#fffcf8',
        gold: '#2f6b4f',
        goldLight: '#e7f0ea',
        ink: '#1e3328',
        paper: '#f3efe6',
        matcha: '#2f6b4f',
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
