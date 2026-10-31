import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const partials = {
  '<!--HEADER-->': 'header.html',
  '<!--FOOTER-->': 'footer.html',
  '<!--COOKIE-->': 'cookie.html',
  '<!--POLICY_BODY-->': 'policy-body.html',
}

function htmlPartials() {
  const dir = resolve('src/partials')
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let out = html
        for (const [token, file] of Object.entries(partials)) {
          if (!out.includes(token)) continue
          const chunk = readFileSync(resolve(dir, file), 'utf8')
          out = out.replaceAll(token, chunk)
        }
        return out
      },
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [htmlPartials()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        location: resolve('location-1.html'),
        policy: resolve('policy.html'),
        safety: resolve('safety.html'),
      },
    },
  },
})
