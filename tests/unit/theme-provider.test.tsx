import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { THEME_SCRIPT, ThemeProvider } from '../../src/lib/theme'
import { ThemeToggle } from '../../src/components/cards/ThemeCard'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function mockSystem(dark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('dark') ? dark : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

const ui = (
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>
)

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  mockSystem(false)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('follows prefers-color-scheme when nothing is stored', () => {
  mockSystem(true)
  render(ui)
  expect(document.documentElement).toHaveClass('dark')
  expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toHaveAttribute('aria-pressed', 'true')
})

it('stored value wins over system preference', () => {
  mockSystem(true)
  localStorage.setItem('theme', 'light')
  render(ui)
  expect(document.documentElement).not.toHaveClass('dark')
})

it('toggle flips the class, aria-pressed and persists', async () => {
  render(ui)
  const btn = screen.getByRole('button', { name: 'Toggle dark mode' })
  expect(btn).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(btn)
  expect(document.documentElement).toHaveClass('dark')
  expect(btn).toHaveAttribute('aria-pressed', 'true')
  expect(localStorage.getItem('theme')).toBe('dark')
  await userEvent.click(btn)
  expect(document.documentElement).not.toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBe('light')
})

it('does not crash when localStorage throws; falls back to system', async () => {
  mockSystem(true)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('denied')
  })
  render(ui)
  expect(document.documentElement).toHaveClass('dark')
  await userEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }))
  expect(document.documentElement).not.toHaveClass('dark')
})

it('index.html contains THEME_SCRIPT', () => {
  expect(readFileSync(resolve(ROOT, 'index.html'), 'utf8').includes(THEME_SCRIPT)).toBe(true)
})

it('THEME_SCRIPT applies stored/system theme', () => {
  mockSystem(true)
  new Function(THEME_SCRIPT)()
  expect(document.documentElement).toHaveClass('dark')
  document.documentElement.classList.remove('dark')
  localStorage.setItem('theme', 'light')
  new Function(THEME_SCRIPT)()
  expect(document.documentElement).not.toHaveClass('dark')
})

it('THEME_SCRIPT falls back to system when localStorage throws', () => {
  mockSystem(true)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  expect(() => new Function(THEME_SCRIPT)()).not.toThrow()
  expect(document.documentElement).toHaveClass('dark')
})

it('THEME_SCRIPT honours stored "dark" even when system prefers light', () => {
  mockSystem(false)
  localStorage.setItem('theme', 'dark')
  new Function(THEME_SCRIPT)()
  expect(document.documentElement).toHaveClass('dark')
})

it('THEME_SCRIPT honours stored "light" when system prefers dark', () => {
  mockSystem(true)
  localStorage.setItem('theme', 'light')
  new Function(THEME_SCRIPT)()
  expect(document.documentElement).not.toHaveClass('dark')
})

it('THEME_SCRIPT does not throw when matchMedia throws', () => {
  window.matchMedia = vi.fn().mockImplementation(() => {
    throw new Error('unsupported')
  }) as unknown as typeof window.matchMedia
  expect(() => new Function(THEME_SCRIPT)()).not.toThrow()
  expect(document.documentElement).not.toHaveClass('dark')
})

function mockLiveSystem(dark: boolean) {
  const handlers = new Set<(e: { matches: boolean }) => void>()
  const removed = vi.fn()
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('dark') ? dark : false,
    media: q,
    addEventListener: (_: string, h: (e: { matches: boolean }) => void) => handlers.add(h),
    removeEventListener: (_: string, h: (e: { matches: boolean }) => void) => {
      removed()
      handlers.delete(h)
    },
  })) as unknown as typeof window.matchMedia
  return {
    handlers,
    removed,
    emit: (matches: boolean) => act(() => handlers.forEach((h) => h({ matches }))),
  }
}

it('follows live prefers-color-scheme changes when nothing is stored', () => {
  const sys = mockLiveSystem(false)
  render(ui)
  expect(document.documentElement).not.toHaveClass('dark')
  sys.emit(true)
  expect(document.documentElement).toHaveClass('dark')
  sys.emit(false)
  expect(document.documentElement).not.toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBeNull()
})

it('ignores system changes once the user has toggled', async () => {
  const sys = mockLiveSystem(false)
  render(ui)
  await userEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }))
  expect(document.documentElement).toHaveClass('dark')
  sys.emit(false)
  expect(document.documentElement).toHaveClass('dark')
})

it('ignores system changes when a theme is stored', () => {
  localStorage.setItem('theme', 'light')
  const sys = mockLiveSystem(false)
  render(ui)
  sys.emit(true)
  expect(document.documentElement).not.toHaveClass('dark')
})

it('removes the system listener on unmount', () => {
  const sys = mockLiveSystem(false)
  const { unmount } = render(ui)
  expect(sys.handlers.size).toBe(1)
  unmount()
  expect(sys.handlers.size).toBe(0)
  expect(sys.removed).toHaveBeenCalled()
})
