/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        cyber: '#0f172a',
        accent: '#38bdf8',
        emerald: '#34d399',
        amber: '#fbbf24',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.35), 0 0 40px rgba(56,189,248,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
