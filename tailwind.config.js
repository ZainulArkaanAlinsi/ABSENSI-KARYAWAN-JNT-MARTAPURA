/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'jne-header': '#0D1B35',
        'jne-bg': '#1A1F2E',
        'jne-card': '#1B2A4A',
        'jne-text': '#FFFFFF',
        'jne-subtext': '#9BA4B4',
        
        'jne-primary': '#E04B3A', // Important Button
        'jne-success': '#16A34A', // Attendance
        'jne-warning': '#D97706', // Permission
        'jne-danger': '#C0392B',  // Lateness/Rejection
        'jne-overtime': '#3D5280', 
        'jne-info': '#3863C3',    // Notification
      },
    },
  },
  plugins: [],
}
