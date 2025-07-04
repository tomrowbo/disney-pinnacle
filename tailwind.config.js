/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/tailwindcss/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'disney-blue': '#003d7a',
        'disney-light-blue': '#0066cc',
        'disney-purple': '#5a3aed',
        'disney-gold': '#fbbf24',
        'disney-dark': '#0a0e27',
        'disney-darker': '#050714',
      },
      fontFamily: {
        'disney': ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}