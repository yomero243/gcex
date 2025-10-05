@type {import('tailwindcss').Config} 
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Aquí está la clave
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff9933',
        secondary: '#00ffff',
        dark: '#1a1a1a',
        light: '#f0f0f0',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
