import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Для GitHub Pages: замените на '/ИМЯ-РЕПОЗИТОРИЯ/'
// Локально и при кастомном домене можно оставить './'
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
