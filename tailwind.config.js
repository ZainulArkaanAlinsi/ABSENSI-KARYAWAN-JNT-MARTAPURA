/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional muted palette aligned with globals.css
        primary: {
          DEFAULT: 'var(--primary-500)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        brand: {
          primary: '#E67E22', // Updated to match mustard
          secondary: '#2C3E50', // Charcoal
          accent: '#10B981', // Emerald
          bg: '#F9F7F2', // Warm Cream
        },
        slate: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
        full: '9999px',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        'plus-jakarta': ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.08)',
        lg: '0 8px 32px rgba(0,0,0,0.10)',
        xl: '0 16px 48px rgba(0,0,0,0.12)',
      },
      backdropBlur: {
        premium: '40px',
      },
    },
  },
  plugins: [],
};