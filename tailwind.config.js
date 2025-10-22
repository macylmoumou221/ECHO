/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',   // Mobile small
      'sm': '640px',   // Mobile large
      'md': '768px',   // Tablets
      'lg': '1024px',  // Laptop small (14")
      'xl': '1280px',  // Laptop medium (15.6")
      '2xl': '1536px', // Desktop
    },
    extend: {
      spacing: {
        'sidebar-collapsed': '80px',
        'sidebar-expanded': '230px',
      },
    },
  },
  plugins: [],
}
