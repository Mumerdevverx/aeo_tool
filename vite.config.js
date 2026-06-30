import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-image',
      '@tiptap/extension-link',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    force: true // Force dependency pre-bundling
  },
  server: {
    force: true, // Force dep optimization on server start
    hmr: {
      overlay: true
    }
  }
})