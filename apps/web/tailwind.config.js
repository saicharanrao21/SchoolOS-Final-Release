/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
          light: '#eff6ff',
        },
        secondary: {
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
          light: '#f5f3ff',
        },
        sidebar: {
          background: '#0f172a',
          foreground: '#94a3b8',
          active: '#1e293b',
          activeForeground: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          background: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
};
