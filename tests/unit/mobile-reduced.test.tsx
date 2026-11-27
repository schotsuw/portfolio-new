import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/motion', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/motion')>()),
  useReducedMotion: () => true,
}))

import MobileDock from '../../src/components/layout/MobileDock'

afterEach(cleanup)

it('dock scrolls with behavior auto under reduced motion', () => {
  render(
    <>
      <section id="m-projects" />
      <MobileDock />
    </>,
  )
  const el = document.getElementById('m-projects')!
  const spy = vi.fn()
  el.scrollIntoView = spy
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
  expect(spy).toHaveBeenCalledWith({ behavior: 'auto' })
})
