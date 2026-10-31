/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0F0B',
        pine: '#0A0F0B',
        surface: '#121A14',
        glass: '#121A14',
        gold: '#C9A96A',
        signal: '#C6FF5E',
        muted: '#7A8580',
        goldLight: '#F3E5AB',
        ink: 'rgb(var(--rgb-ink) / <alpha-value>)',
        paper: 'rgb(var(--rgb-paper) / <alpha-value>)',
        card: 'rgb(var(--rgb-card) / <alpha-value>)',
        matcha: '#2f6b4f',
        kedr: '#1E4D3B',
        kedrLight: '#2E7359',
        violetMetal: '#3B1C32',
        roseMetal: '#6B2D5C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
