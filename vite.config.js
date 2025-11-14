import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/tilda-demo/' : '/',
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})