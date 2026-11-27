import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
const motion = vi.hoisted(() => ({ reduced: false }))
vi.mock('../../src/lib/motion', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/motion')>()),
  useReducedMotion: () => motion.reduced,
}))

import ProjectCard from '../../src/components/cards/ProjectCard'
import PersonalityCard from '../../src/components/cards/PersonalityCard'
import ClockCard from '../../src/components/cards/ClockCard'
import CareerRuler from '../../src/components/cards/CareerRuler'
import AboutMini from '../../src/components/cards/AboutMini'
import ExperienceMini from '../../src/components/cards/ExperienceMini'
import ResumeBanner from '../../src/components/cards/ResumeBanner'
import StackCard from '../../src/components/cards/StackCard'
import { projects, stack } from '../../src/content'

function mockMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  motion.reduced = false
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-26T18:30:15Z'))
  mockMatchMedia()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ProjectCard', () => {
  it('every project renders as a link to /projects/{slug}', () => {
    for (const p of projects) {
      const { unmount } = render(<ProjectCard project={p} />)
      const link = screen.getByRole('link', { name: p.title })
      expect(link).toHaveAttribute('href', `/projects/${p.slug}`)
      // Label in name (WCAG 2.5.3): the link's visible text is exactly its name; status and
      // tagline are its description, and the link stretches over the card.
      expect(link).toHaveTextContent(new RegExp(`^${p.title}$`))
      expect(link).toHaveAccessibleDescription(expect.stringContaining(p.tagline))
      const card = link.closest('[data-card]') as HTMLElement
      expect(card).toHaveClass('relative')
      expect(within(card).getByRole('img')).toHaveAttribute('aria-label')
      expect(within(card).getByText(p.tagline)).toBeInTheDocument()
      unmount()
    }
  })
  it('never sets a fixed pixel height', () => {
    for (const p of projects) {
      const { container, unmount } = render(<ProjectCard project={p} />)
      expect(container.innerHTML).not.toMatch(/(?<![-\w])h-\[\d+px\]/)
      expect(container.innerHTML).not.toMatch(/height:\s*\d+px/)
      unmount()
    }
  })
})

describe('ProjectCard video', () => {
  const withVideo = { ...projects[0], video: { src: '/v.mp4', poster: '/p.jpg' } }
  let pause: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })
  afterEach(() => pause.mockRestore())

  it('autoplays muted, looped and inline with a poster when motion is allowed', () => {
    const { container } = render(<ProjectCard project={withVideo} />)
    const v = container.querySelector('video') as HTMLVideoElement
    expect(v.autoplay).toBe(true)
    expect(v.loop).toBe(true)
    expect(v.muted).toBe(true)
    expect(v.hasAttribute('playsinline')).toBe(true)
    expect(v).toHaveAttribute('poster', '/p.jpg')
  })
  it('does not autoplay under reduced motion but keeps loop, muted, playsInline and poster', () => {
    motion.reduced = true
    const { container } = render(<ProjectCard project={withVideo} />)
    const v = container.querySelector('video') as HTMLVideoElement
    expect(v.autoplay).toBe(false)
    expect(v.loop).toBe(true)
    expect(v.muted).toBe(true)
    expect(v.hasAttribute('playsinline')).toBe(true)
    expect(v).toHaveAttribute('poster', '/p.jpg')
  })
})

describe('PersonalityCard', () => {
  it('shows 180, 100, 200, 480 kg and 68 kg', () => {
    const { container } = render(<PersonalityCard />)
    const text = container.textContent ?? ''
    for (const v of ['180 kg', '100 kg', '200 kg', '480 kg', '68 kg']) expect(text).toContain(v)
    expect(screen.getByText('Squat')).toBeInTheDocument()
    expect(screen.getByText('Bench')).toBeInTheDocument()
    expect(screen.getByText('Deadlift')).toBeInTheDocument()
  })
})

describe('ClockCard', () => {
  it("shows 'Fredericton, NB' and the Atlantic time", () => {
    render(<ClockCard />)
    expect(screen.getByText('Fredericton, NB')).toBeInTheDocument()
    expect(screen.getByText('2:30:15 PM')).toBeInTheDocument()
    expect(screen.getByText('AST')).toBeInTheDocument()
  })
  it('ticks once per second under reduced motion', () => {
    motion.reduced = true
    render(<ClockCard />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('2:30:16 PM')).toBeInTheDocument()
  })
  it('cancels its animation frame on unmount', () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<ClockCard />)
    unmount()
    expect(cancel).toHaveBeenCalled()
    cancel.mockRestore()
  })
  it('clears its interval on unmount under reduced motion', () => {
    motion.reduced = true
    const clear = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<ClockCard />)
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(clear).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    clear.mockRestore()
  })
  describe('visibility', () => {
    let io: { cb: IntersectionObserverCallback; el?: Element; disconnect: Mock<() => void> }
    const show = (isIntersecting: boolean) =>
      act(() => io.cb([{ isIntersecting, target: io.el! } as IntersectionObserverEntry], {} as IntersectionObserver))
    beforeEach(() => {
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(cb: IntersectionObserverCallback) {
            io = { cb, disconnect: vi.fn() }
          }
          observe = (el: Element) => void (io.el = el)
          unobserve = vi.fn()
          disconnect = () => io.disconnect()
          takeRecords = () => []
        },
      )
    })
    afterEach(() => vi.unstubAllGlobals())

    it('runs no animation frames while hidden, starts when shown, and stops when hidden again', () => {
      const raf = vi.spyOn(window, 'requestAnimationFrame')
      const cancel = vi.spyOn(window, 'cancelAnimationFrame')
      render(<ClockCard />)
      expect(raf).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)

      show(true)
      expect(raf).toHaveBeenCalled()
      expect(vi.getTimerCount()).toBeGreaterThan(0)

      show(false)
      expect(cancel).toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
      raf.mockRestore()
      cancel.mockRestore()
    })

    it('pauses the reduced-motion interval while hidden', () => {
      motion.reduced = true
      render(<ClockCard />)
      expect(vi.getTimerCount()).toBe(0)
      show(true)
      expect(vi.getTimerCount()).toBe(1)
      show(false)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('disconnects the observer and clears work on unmount', () => {
      const { unmount } = render(<ClockCard />)
      show(true)
      unmount()
      expect(io.disconnect).toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })
  })
  it('colours the dial from design tokens, not raw hex', () => {
    const { container } = render(<ClockCard />)
    expect(container.querySelector('svg')?.outerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })
})

describe('CareerRuler touch', () => {
  it('lets the page scroll vertically on touch (touch-pan-y, not touch-none)', () => {
    render(<CareerRuler />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('touch-pan-y')
    expect(slider).not.toHaveClass('touch-none')
  })
})

describe('CareerRuler', () => {
  it('ArrowLeft moves to previous year, shows role, reveals Reset to present', () => {
    render(<CareerRuler />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '2026')
    expect(slider).toHaveAttribute('aria-valuemin', '2023')
    expect(slider).toHaveAttribute('aria-valuemax', '2027')
    expect(screen.queryByRole('button', { name: 'Reset to present' })).toBeNull()

    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute('aria-valuenow', '2025')
    expect(slider.getAttribute('aria-valuetext')).toMatch(/2025/)
    expect(screen.getByText('Introhive Services Inc.')).toBeInTheDocument()

    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(screen.getByText('Sonrai Security Inc.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset to present' }))
    expect(slider).toHaveAttribute('aria-valuenow', '2026')
    expect(screen.queryByRole('button', { name: 'Reset to present' })).toBeNull()
  })
  it('clamps at the ends and supports Home/End', () => {
    render(<CareerRuler />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'End' })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '2027')
    fireEvent.keyDown(slider, { key: 'Home' })
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute('aria-valuenow', '2023')
  })
})

describe('small cards', () => {
  it('AboutMini links to /about', () => {
    render(<AboutMini />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about')
  })
  it('AboutMini link has a concise name and a hidden monogram', () => {
    const { container } = render(<AboutMini />)
    expect(screen.getByRole('link', { name: 'About me' })).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
    const monogram = container.querySelector('svg[role="img"]')
    expect(monogram).not.toBeNull()
    expect(monogram!.closest('[aria-hidden="true"]')).not.toBeNull()
  })
  it('ExperienceMini lists each org once and links to /about', () => {
    render(<ExperienceMini />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Introhive Services Inc.')).toBeInTheDocument()
  })
  it('ResumeBanner opens the résumé in a new tab', () => {
    render(<ResumeBanner />)
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('href', '/resume.pdf')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a.getAttribute('rel')).toMatch(/\bnoopener\b/)
  })
  it('StackCard shows every group and item', () => {
    render(<StackCard />)
    for (const g of stack.groups) {
      const list = screen.getByRole('list', { name: g.group })
      expect(within(list).getAllByRole('listitem')).toHaveLength(g.items.length)
    }
  })
})
