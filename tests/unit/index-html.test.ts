// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { renderRouteHtml } from '../../scripts/postbuild'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8')
// Weights rendered above the fold: body 400, chips/labels 500, headings 600.
const WEIGHTS = [400, 500, 600]

it.each(WEIGHTS)('index.html preloads the %i woff2 so the swap does not shift layout', (w) => {
  const href = `/fonts/OpenRunde-${w}.woff2`
  const tag = html.match(new RegExp(`<link[^>]*href="${href}"[^>]*>`))?.[0]
  expect(tag).toBeDefined()
  expect(tag).toMatch(/rel="preload"/)
  expect(tag).toMatch(/as="font"/)
  expect(tag).toMatch(/type="font\/woff2"/)
  expect(tag).toMatch(/\bcrossorigin\b/)
  expect(existsSync(resolve(ROOT, 'public', href.slice(1)))).toBe(true)
})

it('per-route HTML keeps the font preloads', () => {
  const out = renderRouteHtml(html, { title: 't', description: 'd', url: 'https://x/', image: 'https://x/i.png' })
  for (const w of WEIGHTS) expect(out).toContain(`href="/fonts/OpenRunde-${w}.woff2"`)
})
