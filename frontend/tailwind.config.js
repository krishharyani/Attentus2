/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.js",
    "./screens/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#64B6AC',
        secondary: '#BFE0DC',
        background:'#FCFFF7'
      }
    }
  },
  plugins: [],
}

