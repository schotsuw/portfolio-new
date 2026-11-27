import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const motion = vi.hoisted(() => ({ reduced: false }))
vi.mock('../../src/lib/motion', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/motion')>()),
  useReducedMotion: () => motion.reduced,
}))

import Hero from '../../src/components/cards/Hero'
import { site } from '../../src/content'

const realLocation = window.location
const realClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })
}

beforeEach(() => {
  motion.reduced = false
  vi.useFakeTimers()
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  Object.defineProperty(window, 'location', { value: realLocation, configurable: true, writable: true })
  if (realClipboard) Object.defineProperty(navigator, 'clipboard', realClipboard)
  else delete (navigator as { clipboard?: unknown }).clipboard
})

const copyButton = () => screen.getByRole('button', { name: /copy email|copied/i })

describe('Hero', () => {
  it('labels the headline with the full sentence and hides the word spans', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveAttribute('aria-label', site.headline)
    const spans = h1.querySelectorAll('span')
    expect(spans.length).toBe(site.headline.split(' ').length)
    spans.forEach((s) => expect(s).toHaveAttribute('aria-hidden', 'true'))
  })

  it('shows the status chip', () => {
    render(<Hero />)
    expect(screen.getByText(site.statusChip)).toBeInTheDocument()
  })

  it('Copy email writes to clipboard and shows Copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    render(<Hero />)
    await act(async () => {
      fireEvent.click(copyButton())
    })
    expect(writeText).toHaveBeenCalledWith('saran.chotsuwan000@gmail.com')
    expect(copyButton()).toHaveTextContent('Copied')
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(copyButton()).toHaveTextContent('Copy email')
  })

  it.each([
    ['rejects', () => setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })],
    ['is undefined', () => setClipboard(undefined)],
  ])('Copy email falls back to mailto when the clipboard %s', async (_name, arrange) => {
    arrange()
    const fake = { href: 'http://localhost:3000/' }
    Object.defineProperty(window, 'location', { value: fake, configurable: true, writable: true })
    render(<Hero />)
    await act(async () => {
      fireEvent.click(copyButton())
    })
    expect(fake.href).toBe('mailto:saran.chotsuwan000@gmail.com')
    expect(copyButton()).toHaveTextContent('Copy email')
  })

  it('live region is empty on mount and re-announces on every click', async () => {
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) })
    render(<Hero />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('')
    const click = async () => {
      await act(async () => {
        fireEvent.click(copyButton())
      })
    }
    await click()
    // Cleared first so assistive tech sees a change, then set.
    expect(status).toHaveTextContent('')
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(status).toHaveTextContent('saran.chotsuwan000@gmail.com copied to clipboard')
    await click()
    expect(status).toHaveTextContent('')
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(status).toHaveTextContent('saran.chotsuwan000@gmail.com copied to clipboard')
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(status).toHaveTextContent('')
  })

  it('clears pending timers on unmount', async () => {
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) })
    const { unmount } = render(<Hero />)
    await act(async () => {
      fireEvent.click(copyButton())
    })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('Résumé button links /resume.pdf with target _blank rel noopener', () => {
    render(<Hero />)
    const a = screen.getByRole('link', { name: /résumé/i })
    expect(a).toHaveAttribute('href', '/resume.pdf')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a.getAttribute('rel')).toMatch(/\bnoopener\b/)
  })

  it('leaves GitHub and LinkedIn to the footer (no duplicate links)', () => {
    render(<Hero />)
    expect(screen.queryByRole('link', { name: /github/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /linkedin/i })).toBeNull()
  })

  it('cycles a word colour on hover, but not under reduced motion', () => {
    const { unmount } = render(<Hero />)
    const word = screen.getByRole('heading', { level: 1 }).querySelector('span')!
    const before = word.style.color
    fireEvent.mouseEnter(word)
    expect(word.style.color).not.toBe(before)
    unmount()

    motion.reduced = true
    render(<Hero />)
    const still = screen.getByRole('heading', { level: 1 }).querySelector('span')!
    const was = still.style.color
    fireEvent.mouseEnter(still)
    expect(still.style.color).toBe(was)
  })
})
