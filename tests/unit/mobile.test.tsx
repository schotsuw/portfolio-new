import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../../src/App'
import BottomBlur from '../../src/components/layout/BottomBlur'
import MobileDock from '../../src/components/layout/MobileDock'
import MobileHome from '../../src/components/layout/MobileHome'
import { projects } from '../../src/content'
import { RouterProvider } from '../../src/lib/router'
import { ThemeProvider } from '../../src/lib/theme'

let observers: { cb: IntersectionObserverCallback; targets: Element[]; disconnect: ReturnType<typeof vi.fn> }[] = []

beforeEach(() => {
  observers = []
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
  class IO {
    rec: (typeof observers)[number]
    disconnect = vi.fn()
    constructor(cb: IntersectionObserverCallback) {
      this.rec = { cb, targets: [], disconnect: this.disconnect }
      observers.push(this.rec)
    }
    observe = (el: Element) => void this.rec.targets.push(el)
    unobserve = vi.fn()
    takeRecords = () => []
  }
  vi.stubGlobal('IntersectionObserver', IO)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function withSections() {
  return render(
    <ThemeProvider>
      <RouterProvider>
        <MobileHome />
        <MobileDock />
      </RouterProvider>
    </ThemeProvider>,
  )
}

it('dock has 4 labelled buttons', () => {
  render(<MobileDock />)
  for (const name of ['Home', 'Projects', 'About', 'Contact']) {
    expect(screen.getByRole('button', { name })).toBeInTheDocument()
  }
})

it('intersecting #m-about sets aria-current on About', () => {
  withSections()
  const about = document.getElementById('m-about')!
  const rec = observers.find((o) => o.targets.includes(about))!
  expect(rec).toBeDefined()
  act(() => {
    rec.cb([{ target: about, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
  })
  expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute('aria-current', 'location')
  expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current')
})

it('clicking Projects scrolls #m-projects into view', () => {
  withSections()
  const el = document.getElementById('m-projects')!
  const spy = vi.fn()
  el.scrollIntoView = spy
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
  expect(spy).toHaveBeenCalledWith({ behavior: 'smooth' })
})

it('dock disconnects its IntersectionObserver on unmount', () => {
  const { unmount } = render(<MobileDock />)
  expect(observers).toHaveLength(1)
  expect(observers[0].disconnect).not.toHaveBeenCalled()
  unmount()
  expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
})

it('MobileHome has the four sections in order with projects in content order', () => {
  render(
    <ThemeProvider>
      <RouterProvider>
        <MobileHome />
      </RouterProvider>
    </ThemeProvider>,
  )
  const ids = Array.from(document.querySelectorAll('section[id^="m-"]')).map((s) => s.id)
  expect(ids).toEqual(['m-home', 'm-projects', 'm-about', 'm-contact'])
  const sec = document.getElementById('m-projects')!
  expect(within(sec).getByRole('heading', { name: 'Selected projects' })).toBeInTheDocument()
  const titles = within(sec)
    .getAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)
  expect(titles).toEqual(['Selected projects', ...projects.map((p) => p.title)])
})

it('BottomBlur renders 5 hidden layers', () => {
  const { container } = render(<BottomBlur />)
  const root = container.firstElementChild!
  expect(root).toHaveAttribute('aria-hidden', 'true')
  expect(root.querySelectorAll('span')).toHaveLength(5)
})

it('App renders a single footer', () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
  expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
})

it('MobileHome top section renders exactly one monogram (AboutMini keeps its own photo fallback)', () => {
  render(
    <ThemeProvider>
      <RouterProvider>
        <MobileHome />
      </RouterProvider>
    </ThemeProvider>,
  )
  expect(within(document.getElementById('m-home')!).getAllByRole('img', { name: 'SC monogram' })).toHaveLength(1)
})

it('hides the dock and bottom blur while a project overlay is open', () => {
  history.pushState(null, '', '/projects/ask-introhive')
  try {
    const { container } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull()
    expect(container.ownerDocument.querySelector('.bottom-gradient-blur')).toBeNull()
  } finally {
    history.pushState(null, '', '/')
  }
})

it('shows the dock on home', () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
  expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
})

it('shows the bottom blur on home', () => {
  const { container } = render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
  const blur = container.ownerDocument.querySelector('.bottom-gradient-blur')
  expect(blur).not.toBeNull()
  expect(blur).toHaveAttribute('aria-hidden', 'true')
})
