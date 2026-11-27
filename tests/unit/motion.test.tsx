import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const instances: { stop: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }[] = []
vi.mock('lenis', () => ({
  default: class {
    stop = vi.fn()
    start = vi.fn()
    destroy = vi.fn()
    constructor() {
      instances.push(this)
    }
  },
}))
vi.mock('lenis/dist/lenis.css', () => ({}))

let reduced = false
vi.mock('motion/react', async (orig) => ({
  ...(await orig<typeof import('motion/react')>()),
  useReducedMotion: () => reduced,
}))

import { registerOverlayOpen, useLenis } from '../../src/lib/motion'

function Consumer({ out }: { out: unknown[] }) {
  out.push(useLenis())
  return null
}

beforeEach(() => {
  reduced = false
  instances.length = 0
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('min-width') || q.includes('pointer'),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

it('two consumers share one Lenis; overlays stop/start it; last consumer destroys it', () => {
  const a: unknown[] = []
  const b: unknown[] = []
  const r1 = render(<Consumer out={a} />)
  const r2 = render(<Consumer out={b} />)
  expect(instances).toHaveLength(1)
  expect(a.at(-1)).toBe(b.at(-1))
  const h = registerOverlayOpen()
  expect(instances[0].stop).toHaveBeenCalled()
  h.release()
  expect(instances[0].start).toHaveBeenCalled()
  r1.unmount()
  expect(instances[0].destroy).not.toHaveBeenCalled()
  r2.unmount()
  expect(instances[0].destroy).toHaveBeenCalledTimes(1)
})

function mockLiveMedia(initial: { wide: boolean; fine: boolean }) {
  const state = { ...initial }
  const handlers = new Set<() => void>()
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    get matches() {
      return q.includes('min-width') ? state.wide : q.includes('pointer') ? state.fine : false
    },
    media: q,
    addEventListener: (_: string, h: () => void) => handlers.add(h),
    removeEventListener: (_: string, h: () => void) => handlers.delete(h),
  })) as unknown as typeof window.matchMedia
  return {
    handlers,
    set(next: Partial<typeof state>) {
      Object.assign(state, next)
      act(() => handlers.forEach((h) => h()))
    },
  }
}

it('creates and destroys Lenis as the viewport crosses the desktop boundary', () => {
  const mm = mockLiveMedia({ wide: false, fine: true })
  const out: unknown[] = []
  const r = render(<Consumer out={out} />)
  expect(instances).toHaveLength(0)
  expect(out.at(-1)).toBeNull()
  mm.set({ wide: true })
  expect(instances).toHaveLength(1)
  expect(out.at(-1)).toBe(instances[0])
  mm.set({ wide: false })
  expect(instances[0].destroy).toHaveBeenCalledTimes(1)
  expect(out.at(-1)).toBeNull()
  mm.set({ wide: true, fine: false })
  expect(instances).toHaveLength(1)
  mm.set({ fine: true })
  expect(instances).toHaveLength(2)
  r.unmount()
  expect(instances[1].destroy).toHaveBeenCalledTimes(1)
})

it('removes its matchMedia listeners on unmount', () => {
  const mm = mockLiveMedia({ wide: true, fine: true })
  const r = render(<Consumer out={[]} />)
  expect(mm.handlers.size).toBeGreaterThan(0)
  r.unmount()
  expect(mm.handlers.size).toBe(0)
})

it('destroys Lenis when reduced motion turns on at runtime and recreates it when off', () => {
  mockLiveMedia({ wide: true, fine: true })
  const out: unknown[] = []
  const r = render(<Consumer out={out} />)
  expect(instances).toHaveLength(1)
  reduced = true
  r.rerender(<Consumer out={out} />)
  expect(instances[0].destroy).toHaveBeenCalledTimes(1)
  expect(out.at(-1)).toBeNull()
  reduced = false
  r.rerender(<Consumer out={out} />)
  expect(instances).toHaveLength(2)
})
