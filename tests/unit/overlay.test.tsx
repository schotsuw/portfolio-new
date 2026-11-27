import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const closeOverlay = vi.fn()
vi.mock('../../src/lib/router', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/router')>()),
  closeOverlay: () => closeOverlay(),
}))

import Overlay from '../../src/components/overlay/Overlay'
import { ThemeProvider } from '../../src/lib/theme'

beforeEach(() => {
  closeOverlay.mockClear()
  document.body.style.overflow = ''
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

const ui = (open = true) => (
  <ThemeProvider>
    <button>opener</button>
    <Overlay open={open} label="Project">
      <a href="#x">first-link</a>
    </Overlay>
  </ThemeProvider>
)

it('has dialog semantics and locks body scroll', () => {
  render(ui())
  const d = screen.getByRole('dialog', { name: 'Project' })
  expect(d).toHaveAttribute('aria-modal', 'true')
  expect(d).toHaveAttribute('data-lenis-prevent')
  expect(document.body.style.overflow).toBe('hidden')
})

it('Esc calls closeOverlay', async () => {
  render(ui())
  await userEvent.keyboard('{Escape}')
  expect(closeOverlay).toHaveBeenCalledTimes(1)
})

it('Close button calls closeOverlay', async () => {
  render(ui())
  await userEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(closeOverlay).toHaveBeenCalledTimes(1)
})

it('Tab from last focusable wraps to first, Shift+Tab wraps back', async () => {
  render(ui())
  const dialog = screen.getByRole('dialog')
  const focusables = dialog.querySelectorAll<HTMLElement>('a[href], button')
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  last.focus()
  await userEvent.tab()
  expect(first).toHaveFocus()
  await userEvent.tab({ shift: true })
  expect(last).toHaveFocus()
})

it('body overflow restored on unmount', () => {
  document.body.style.overflow = 'auto'
  const { unmount } = render(ui())
  expect(document.body.style.overflow).toBe('hidden')
  unmount()
  expect(document.body.style.overflow).toBe('auto')
})

it('focus returns to opener once the exit animation has finished', async () => {
  const { rerender } = render(ui(false))
  const opener = screen.getByText('opener')
  opener.focus()
  rerender(ui(true))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(opener).not.toHaveFocus()
  rerender(ui(false))
  // Still exiting: the dialog is mounted and focus has not been handed back yet.
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(opener).not.toHaveFocus()
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(opener).toHaveFocus()
})

it('ref-counts body overflow across stacked overlays in either close order', () => {
  for (const order of [[0, 1], [1, 0]]) {
    document.body.style.overflow = 'auto'
    const { rerender, unmount } = render(
      <ThemeProvider>
        <Overlay open label="A"><p>a</p></Overlay>
        <Overlay open label="B"><p>b</p></Overlay>
      </ThemeProvider>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    const both = (a: boolean, b: boolean) => (
      <ThemeProvider>
        <Overlay open={a} label="A"><p>a</p></Overlay>
        <Overlay open={b} label="B"><p>b</p></Overlay>
      </ThemeProvider>
    )
    rerender(both(order[0] !== 0, order[0] !== 1))
    expect(document.body.style.overflow).toBe('hidden')
    rerender(both(false, false))
    expect(document.body.style.overflow).toBe('auto')
    unmount()
  }
})

it('single Esc closes only the topmost overlay', async () => {
  render(
    <ThemeProvider>
      <Overlay open label="A"><p>a</p></Overlay>
      <Overlay open label="B"><p>b</p></Overlay>
    </ThemeProvider>,
  )
  await userEvent.keyboard('{Escape}')
  expect(closeOverlay).toHaveBeenCalledTimes(1)
})
