import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import DesktopGrid from '../../src/components/layout/DesktopGrid'
import Footer from '../../src/components/layout/Footer'
import { RouterProvider } from '../../src/lib/router'
import { ThemeProvider } from '../../src/lib/theme'
import { site } from '../../src/content'

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

function renderGrid() {
  return render(
    <ThemeProvider>
      <RouterProvider>
        <DesktopGrid />
      </RouterProvider>
    </ThemeProvider>,
  )
}

it('column 1 first child is Ask Introhive', () => {
  renderGrid()
  const col = screen.getByTestId('grid-col-1')
  const first = col.firstElementChild as HTMLElement
  expect(within(first).getByRole('heading', { name: /Ask Introhive/i })).toBeInTheDocument()
})

it('the hero is top-centre: the first block of column 2, and the only h1 in the grid', () => {
  renderGrid()
  const col = screen.getByTestId('grid-col-2')
  const blocks = Array.from(col.children) as HTMLElement[]
  const heroIdx = blocks.findIndex((b) => within(b).queryByRole('heading', { level: 1 }))
  expect(heroIdx).toBe(0)
  expect(blocks[0]).toHaveAttribute('aria-label', 'Introduction')
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(within(col).getByRole('link', { name: 'About me' })).toBeInTheDocument()
})

it('column 3 starts with the theme card and has the other cards', () => {
  renderGrid()
  const col = screen.getByTestId('grid-col-3')
  expect(within(col).getByRole('heading', { name: /Plant as Battery/i })).toBeInTheDocument()
  expect(within(col).getByRole('heading', { name: /Introhive MCP/i })).toBeInTheDocument()
})

it('footer links to GitHub and LinkedIn in new tabs and shows copyright', () => {
  render(<Footer />)
  for (const [name, href] of [['GitHub', site.github], ['LinkedIn', site.linkedin]]) {
    const a = screen.getByRole('link', { name })
    expect(a).toHaveAttribute('href', href)
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'))
  }
  expect(screen.getByText(`© 2026 ${site.name}`)).toBeInTheDocument()
})
