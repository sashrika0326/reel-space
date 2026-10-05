/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0D0714',
        surface: '#1A1128',
        'surface-hover': '#241A34',
        mint: '#39FFC1',
        'soft-pink': '#FF6FC0',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #7C2CE0 0%, #E0219C 50%, #FF6B35 100%)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '18px',
      },
      borderColor: {
        subtle: 'rgba(245, 240, 250, 0.12)',
      },
    },
  },
  plugins: [],
}