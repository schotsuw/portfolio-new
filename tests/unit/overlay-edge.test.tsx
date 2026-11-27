import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let reduced = false
vi.mock('../../src/lib/motion', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/motion')>()),
  useReducedMotion: () => reduced,
}))
// Strip the built-in chrome buttons so the dialog can have zero focusable children.
vi.mock('../../src/components/cards/ThemeCard', () => ({ ThemeToggle: () => null }))
vi.mock('../../src/components/glass/GlassButton', () => ({ default: () => null }))

import Overlay from '../../src/components/overlay/Overlay'

beforeEach(() => {
  reduced = false
})
afterEach(cleanup)

it('with no focusable children, Tab and Shift+Tab keep focus on the dialog container', async () => {
  render(
    <Overlay open label="Empty">
      <p>nothing to focus</p>
    </Overlay>,
  )
  const dialog = screen.getByRole('dialog', { name: 'Empty' })
  expect(dialog).toHaveFocus()
  await userEvent.tab()
  expect(dialog).toHaveFocus()
  await userEvent.tab({ shift: true })
  expect(dialog).toHaveFocus()
})

it('slides up from the bottom when motion is allowed', () => {
  render(
    <Overlay open label="Slide">
      <p>x</p>
    </Overlay>,
  )
  expect(screen.getByRole('dialog').style.transform).toContain('translateY(100%)')
})

it('uses a fade with no slide transform under reduced motion', () => {
  reduced = true
  render(
    <Overlay open label="Fade">
      <p>x</p>
    </Overlay>,
  )
  const d = screen.getByRole('dialog')
  expect(d.style.opacity).toBe('0')
  expect(d.style.transform).not.toContain('translate')
})
