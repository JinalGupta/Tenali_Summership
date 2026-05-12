/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0F2D5A', light: '#1A4A8A', dark: '#0A1F3D' },
        teal: { DEFAULT: '#009B83', light: '#00C4A7', dark: '#007A67' },
        amber: { DEFAULT: '#F5A623', light: '#FFB84D', dark: '#C4851A' },
        coral: { DEFAULT: '#E84D3A', light: '#F07565', dark: '#C43A2A' },
        cream: { DEFAULT: '#F0F4F8', dark: '#E4ECF4' },
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { card: '12px', input: '8px', btn: '24px' },
    },
  },
  plugins: [],
}