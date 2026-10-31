import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve('index.html'),
    },
  },
})
