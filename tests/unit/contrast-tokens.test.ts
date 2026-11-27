import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const css = readFileSync(resolve(ROOT, 'src/styles/index.css'), 'utf8')

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Value of a custom property inside the first `selector { ... }` block. */
function token(selector: string, name: string): string {
  const block = css.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
  const v = block.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`))?.[1]
  if (!v) throw new Error(`token ${name} not found in ${selector}`)
  return v
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('focus ring token (WCAG 1.4.11)', () => {
  it.each(['#f0f0f0', '#ffffff'])('light value has >= 3:1 against %s', (bg) => {
    expect(contrast(token(':root', '--focus-ring'), bg)).toBeGreaterThanOrEqual(3)
  })

  it.each(['#000000', '#161616'])('dark value has >= 3:1 against %s', (bg) => {
    expect(contrast(token('.dark', '--focus-ring'), bg)).toBeGreaterThanOrEqual(3)
  })

  it('every focus style uses the token, never the raw accent', () => {
    const files = walk(resolve(ROOT, 'src')).filter((f) => /\.(tsx?|css)$/.test(f))
    const offenders = files.filter((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .some((l) => /focus|outline/.test(l) && /--color-accent/.test(l)),
    )
    expect(offenders.map((f) => f.replace(ROOT, ''))).toEqual([])
  })
})

describe('hero hover cycle colours (large text, 3:1)', () => {
  it.each([1, 2, 3])('light cycle colour %i passes on the page background', (n) => {
    expect(contrast(token(':root', `--cycle-${n}`), '#f0f0f0')).toBeGreaterThanOrEqual(3)
  })
})
