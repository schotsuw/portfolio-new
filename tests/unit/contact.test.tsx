import { cleanup, render, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MobileHome from '../../src/components/layout/MobileHome'
import { site } from '../../src/content'
import { RouterProvider } from '../../src/lib/router'
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
  class IO {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = () => []
  }
  vi.stubGlobal('IntersectionObserver', IO)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('mobile Contact section', () => {
  const contact = () => {
    render(
      <ThemeProvider>
        <RouterProvider>
          <MobileHome />
        </RouterProvider>
      </ThemeProvider>,
    )
    return within(document.getElementById('m-contact')!)
  }

  it('shows the email as visible text', () => {
    expect(contact().getByText(site.email)).toBeInTheDocument()
  })

  it('has a Copy email control', () => {
    expect(contact().getByRole('button', { name: /copy email/i })).toBeInTheDocument()
  })

  it('links LinkedIn and GitHub from site content', () => {
    const c = contact()
    expect(c.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', site.linkedin)
    expect(c.getByRole('link', { name: /github/i })).toHaveAttribute('href', site.github)
  })

  it('still has the résumé banner', () => {
    expect(contact().getByRole('link', { name: /résumé/i })).toHaveAttribute('href', site.resume)
  })
})
