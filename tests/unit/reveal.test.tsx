import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let reduced = false
vi.mock('../../src/lib/motion', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/motion')>()),
  useReducedMotion: () => reduced,
}))

import Reveal from '../../src/components/layout/Reveal'

const observed: Element[] = []
beforeEach(() => {
  reduced = false
  observed.length = 0
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = (el: Element) => observed.push(el)
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

function renderReveal() {
  render(
    <Reveal className="flex flex-1">
      <p>card</p>
    </Reveal>,
  )
  return screen.getByText('card').parentElement as HTMLElement
}

it('starts hidden and lowered, and waits for the card to scroll into view', () => {
  const el = renderReveal()
  expect(el).toHaveAttribute('data-reveal')
  expect(el).toHaveClass('flex', 'flex-1')
  expect(el.style.opacity).toBe('0')
  expect(el.style.transform).toMatch(/translateY\(24px\)/)
  expect(observed).toContain(el)
})

it('under reduced motion renders the final state with no opacity or transform animation', () => {
  reduced = true
  const el = renderReveal()
  expect(el).toHaveAttribute('data-reveal')
  expect(el).toHaveClass('flex', 'flex-1')
  expect(el.style.opacity).toBe('')
  expect(el.style.transform).toBe('')
  expect(observed).toHaveLength(0)
})

it('without IntersectionObserver renders the final state rather than staying hidden', () => {
  vi.stubGlobal('IntersectionObserver', undefined)
  const el = renderReveal()
  expect(el).toHaveAttribute('data-reveal')
  expect(el.style.opacity).toBe('')
  expect(el.style.transform).toBe('')
})
