import { cleanup, render, screen } from '@testing-library/react'
import { site } from '../../src/content'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { ThemeProvider } from '../../src/lib/theme'

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

it('renders a main landmark', () => {
  // ThemeProvider lives in main.tsx, so tests supply it.
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
  expect(screen.getByRole('main')).toBeInTheDocument()
})

it('home links GitHub and LinkedIn once each per layout: footer (desktop) and Contact section (mobile)', () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
  for (const [name, href] of [['GitHub', site.github], ['LinkedIn', site.linkedin]]) {
    const links = screen.getAllByRole('link', { name })
    expect(links).toHaveLength(2)
    for (const l of links) expect(l).toHaveAttribute('href', href)
    expect(links.filter((l) => l.closest('footer'))).toHaveLength(1)
    expect(links.filter((l) => l.closest('#m-contact'))).toHaveLength(1)
  }
})
