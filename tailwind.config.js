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
        jne: {
          red:        '#E31E24', // JNE Primary Red
          'red-dark': '#C01A1F', // Hover / pressed
          'red-light':'#FDECEA', // Light tint for badges / bg
          blue:       '#004080', // JNE Navy Blue (sidebar/header)
          'blue-dark':'#002D5C', // Deeper navy
          'blue-light':'#E6EEF8',// Soft blue tint
          gray:       '#F4F7FE', // Page background
          'gray-mid': '#E0E7F5', // Dividers, subtle borders
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
        sm:   '4px',   // was 8px  — tepi tajam, koran
        md:   '6px',   // was 12px
        lg:   '8px',   // was 16px
        xl:   '10px',  // was 20px — stat cards
        '2xl':'12px',  // was 24px — modal, panel
        '3xl':'14px',  // was 32px
        '4xl':'18px',  // was 40px
        '5xl':'22px',  // was 48px
        full: '9999px',
      },
      fontFamily: {
        outfit:          ['var(--font-outfit)', 'sans-serif'],
        inter:           ['var(--font-inter)', 'sans-serif'],
        'plus-jakarta':  ['var(--font-plus-jakarta)', 'sans-serif'],
        playfair:        ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:            ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", 'monospace'],
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