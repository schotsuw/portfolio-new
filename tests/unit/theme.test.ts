import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const css = readFileSync(resolve(ROOT, 'src/styles/index.css'), 'utf8')
const block = (sel: string) =>
  new RegExp(`${sel}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
const names = (b: string) => [...b.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])

it('.dark overrides every mode-aware var defined on :root', () => {
  const root = names(block(':root'))
  expect(root.length).toBeGreaterThan(0)
  expect(names(block('\\.dark')).sort()).toEqual(root.sort())
})

it('exposes mode-aware vars as theme colors via @theme inline', () => {
  for (const n of names(block(':root'))) {
    expect(css).toContain(`--color-${n.slice(2)}: var(${n})`)
  }
})

it('status-shipped is green-ish and not a banned reference accent', () => {
  expect(css).toContain('--color-status-shipped: #2fbf71')
  expect(css.toLowerCase()).not.toMatch(/#3ddc84|#0f9d58/)
})
