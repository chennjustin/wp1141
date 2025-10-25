/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自然旅行色調
        'cream': '#F8F6F3',
        'mist': '#E8E6E3',
        'stone': '#6B7280',
        'slate-blue': '#7C8B9F',
        'moss': '#8B9B8F',
        'warm-gray': '#9CA3AF',
        'soft-shadow': 'rgba(0, 0, 0, 0.05)'
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'float': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'smooth': '12px'
      }
    },
  },
  plugins: [],
}
