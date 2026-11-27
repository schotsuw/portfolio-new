import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const created = vi.fn()
vi.mock('lenis', () => ({
  default: class {
    stop = vi.fn()
    start = vi.fn()
    destroy = vi.fn()
    constructor() {
      created()
    }
  },
}))
vi.mock('lenis/dist/lenis.css', () => ({}))

let reduced = false
vi.mock('motion/react', async (orig) => ({
  ...(await orig<typeof import('motion/react')>()),
  useReducedMotion: () => reduced,
}))

import App from '../../src/App'
import { ThemeProvider } from '../../src/lib/theme'

function desktopMedia(desktop: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: desktop && (q.includes('min-width') || q.includes('pointer')),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

const renderApp = () =>
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )

beforeEach(() => {
  reduced = false
  created.mockClear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = () => []
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('mounts smooth scroll (Lenis) once on desktop', () => {
  desktopMedia(true)
  renderApp()
  expect(created).toHaveBeenCalledTimes(1)
})

it('does not mount Lenis on touch / narrow viewports', () => {
  desktopMedia(false)
  renderApp()
  expect(created).not.toHaveBeenCalled()
})

it('does not mount Lenis under reduced motion', () => {
  desktopMedia(true)
  reduced = true
  renderApp()
  expect(created).not.toHaveBeenCalled()
})
