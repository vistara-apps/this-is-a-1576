/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(217, 70%, 50%)',
        accent: 'hsl(147, 60%, 45%)',
        bg: 'hsl(220, 25%, 95%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(220, 20%, 20%)',
        'text-secondary': 'hsl(220, 15%, 50%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '24px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}