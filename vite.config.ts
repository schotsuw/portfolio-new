/// <reference types="vitest/config" />
import { existsSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Vercel serves `/projects/x` from `projects/x/index.html`; `vite preview` only does that for a
 * trailing slash and otherwise falls back to the SPA shell. Mirror Vercel so local previews (and
 * the e2e og:title check) get the per-route HTML written by scripts/postbuild.ts.
 */
function previewDirIndex(): Plugin {
  return {
    name: 'preview-dir-index',
    configurePreviewServer(server) {
      const dist = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '/').split('?')
        if (!path.endsWith('/') && !/\.[^/]*$/.test(path)) {
          let file: string
          try {
            file = resolve(join(dist, decodeURIComponent(path), 'index.html'))
          } catch {
            return next()
          }
          if (file.startsWith(dist + sep) && existsSync(file)) {
            req.url = `${path}/index.html${query === undefined ? '' : `?${query}`}`
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), previewDirIndex()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: false,
  },
})
