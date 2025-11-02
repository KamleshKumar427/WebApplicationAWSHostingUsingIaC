// Keeping ESM Tailwind config to avoid CJS/ESM conflicts in Vite ESM project
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
