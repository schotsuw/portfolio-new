import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GlassChip from '../../src/components/glass/GlassChip'
import GlassButton from '../../src/components/glass/GlassButton'
afterEach(cleanup)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const css = readFileSync(resolve(ROOT, 'src/styles/glass.css'), 'utf8')
const count = (re: RegExp) => (css.match(re) ?? []).length
// Declarations only: anchored at line start so `@supports (backdrop-filter: ...)` is not counted.
const DECL = (prop: string) => new RegExp(`^\\s*${prop}\\s*:`, 'gm')

describe('GlassChip', () => {
  it("renders 'In progress' for in-progress", () => {
    render(<GlassChip status="in-progress" />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })
  it("renders 'Shipped' for shipped", () => {
    render(<GlassChip status="shipped" />)
    expect(screen.getByText('Shipped')).toBeInTheDocument()
  })
})

describe('GlassChip status dot', () => {
  it.each([
    ['shipped', 'var(--color-status-shipped)'],
    ['in-progress', 'var(--color-status-progress)'],
  ] as const)('maps %s to its status colour', (status, colour) => {
    const { container } = render(<GlassChip status={status} />)
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--chip-dot')).toBe(colour)
  })
})

describe('non-DOM props', () => {
  it('GlassButton does not leak icon/tint/as onto the DOM', () => {
    const { container } = render(
      <GlassButton as="a" href="/x" tint="accent" icon={<i data-testid="ic" />} className="extra">
        Go
      </GlassButton>,
    )
    const a = container.querySelector('a') as HTMLElement
    for (const attr of ['icon', 'tint', 'as', 'classname']) expect(a.hasAttribute(attr)).toBe(false)
    expect(a).toHaveClass('glass-btn-root', 'glass-tint-accent', 'extra')
  })
  it('GlassChip renders only DOM-safe attributes', () => {
    const { container } = render(<GlassChip status="shipped" />)
    expect((container.firstElementChild as HTMLElement).hasAttribute('status')).toBe(false)
  })
})

describe('GlassButton', () => {
  it('spreads aria props onto a button and fires onClick', () => {
    let clicked = false
    render(
      <GlassButton aria-label="Toggle theme" aria-pressed={true} onClick={() => (clicked = true)}>
        x
      </GlassButton>,
    )
    const b = screen.getByRole('button', { name: 'Toggle theme' })
    expect(b).toHaveAttribute('aria-pressed', 'true')
    b.click()
    expect(clicked).toBe(true)
  })
  it('renders an anchor with href when as="a"', () => {
    render(
      <GlassButton as="a" href="https://example.com">
        Go
      </GlassButton>,
    )
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', 'https://example.com')
  })
})

describe('glass.css', () => {
  it('pairs every backdrop-filter with -webkit-backdrop-filter and mask-composite with -webkit-mask-composite', () => {
    expect(count(DECL('backdrop-filter'))).toBe(count(DECL('-webkit-backdrop-filter')))
    expect(count(DECL('mask-composite'))).toBe(count(DECL('-webkit-mask-composite')))
    expect(count(DECL('backdrop-filter'))).toBeGreaterThan(0)
    expect(count(DECL('mask-composite'))).toBeGreaterThan(0)
  })
  it('registers @property --glass-angle-1 and --glass-angle-2', () => {
    expect(css).toMatch(/@property\s+--glass-angle-1/)
    expect(css).toMatch(/@property\s+--glass-angle-2/)
  })
  it('has @supports not (backdrop-filter fallback', () => {
    expect(css).toMatch(/@supports not \(\(?(-webkit-)?backdrop-filter/)
  })
  it('uses a shadow colour var that does not share the .glass-shadow class name', () => {
    expect(css).not.toMatch(/--glass-shadow\s*:/)
    expect(css).not.toMatch(/var\(--glass-shadow\)/)
  })
  it('.bottom-gradient-blur has pointer-events: none', () => {
    const m = css.match(/\.bottom-gradient-blur\s*\{[^}]*\}/)
    expect(m?.[0]).toMatch(/pointer-events:\s*none/)
  })
  it('angle properties inherit so root hover values reach the rim/sheen pseudo-elements', () => {
    for (const n of ['1', '2']) {
      const m = css.match(new RegExp(`@property\\s+--glass-angle-${n}\\s*\\{[^}]*\\}`))
      expect(m?.[0]).toMatch(/inherits:\s*true/)
    }
  })
  it('accent tint selector has enough specificity to beat .dark .glass-btn-root', () => {
    expect(css).toMatch(/\.dark \.glass-btn-root\.glass-tint-accent/)
    expect(css).toMatch(/\.glass-btn-root\.glass-tint-accent/)
    expect(css).not.toMatch(/^\.glass-tint-accent\s*[,{]/m)
  })
})
