import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  Link,
  RouterProvider,
  closeOverlay,
  navigate,
  parsePath,
  useRoute,
} from '../../src/lib/router'

function Probe() {
  const route = useRoute()
  return <div data-testid="route">{JSON.stringify(route)}</div>
}

function mount() {
  return render(
    <RouterProvider>
      <Probe />
      <Link href="/projects/slang-or-not">open</Link>
    </RouterProvider>,
  )
}

const routeText = () => screen.getByTestId('route').textContent

afterEach(cleanup)

beforeEach(() => {
  history.replaceState(null, '', '/')
})

describe('parsePath', () => {
  it('parses a known project slug', () => {
    expect(parsePath('/projects/slang-or-not')).toEqual({ name: 'project', slug: 'slang-or-not' })
  })
  it('falls back to home for unknown slug or path', () => {
    expect(parsePath('/projects/nope')).toEqual({ name: 'home' })
    expect(parsePath('/foo')).toEqual({ name: 'home' })
  })
  it('handles trailing slashes and root', () => {
    expect(parsePath('/about/')).toEqual({ name: 'about' })
    expect(parsePath('/')).toEqual({ name: 'home' })
  })
})

describe('router', () => {
  it('Link click pushes state and updates route', () => {
    const before = history.length
    mount()
    fireEvent.click(screen.getByText('open'))
    expect(location.pathname).toBe('/projects/slang-or-not')
    expect(history.length).toBe(before + 1)
    expect(routeText()).toContain('slang-or-not')
  })

  it('ctrl+click is not intercepted', () => {
    mount()
    let prevented: boolean | undefined
    const record = (e: Event) => {
      prevented = e.defaultPrevented
      e.preventDefault() // stop jsdom's "navigation not implemented" noise
    }
    document.addEventListener('click', record)
    try {
      fireEvent.click(screen.getByText('open'), { ctrlKey: true })
    } finally {
      document.removeEventListener('click', record)
    }
    expect(prevented).toBe(false)
    expect(location.pathname).toBe('/')
  })

  it('middle click is not intercepted', () => {
    mount()
    let prevented: boolean | undefined
    const record = (e: Event) => {
      prevented = e.defaultPrevented
      e.preventDefault() // stop jsdom's "navigation not implemented" noise
    }
    document.addEventListener('click', record)
    try {
      fireEvent.click(screen.getByText('open'), { button: 1 })
    } finally {
      document.removeEventListener('click', record)
    }
    expect(prevented).toBe(false)
    expect(location.pathname).toBe('/')
  })

  it('closeOverlay after direct load replaces to /', () => {
    history.replaceState(null, '', '/projects/ask-introhive')
    mount()
    expect(routeText()).toContain('ask-introhive')
    const len = history.length
    act(() => closeOverlay())
    expect(location.pathname).toBe('/')
    expect(history.length).toBe(len)
    expect(routeText()).toContain('home')
  })

  it('closeOverlay after in-app open goes back', async () => {
    mount()
    fireEvent.click(screen.getByText('open'))
    expect(history.state).toEqual({ fromHome: true })
    act(() => closeOverlay())
    await waitFor(() => expect(location.pathname).toBe('/'))
    expect(routeText()).toContain('home')
  })

  it('navigate from an overlay does not mark fromHome', () => {
    history.replaceState(null, '', '/about')
    mount()
    act(() => navigate('/projects/slang-or-not'))
    expect(history.state?.fromHome).toBeFalsy()
  })

  it('replace between overlays preserves fromHome so close goes back', async () => {
    mount()
    fireEvent.click(screen.getByText('open'))
    const len = history.length
    act(() => navigate('/projects/ask-introhive', { replace: true }))
    expect(history.length).toBe(len)
    expect(history.state).toEqual({ fromHome: true })
    act(() => closeOverlay())
    await waitFor(() => expect(location.pathname).toBe('/'))
    expect(history.length).toBe(len)
  })

  it('external and mailto links are not intercepted and do not throw', () => {
    render(
      <RouterProvider>
        <Link href="https://github.com/schotsuw">gh</Link>
        <Link href="mailto:a@b.co">mail</Link>
        <Link href="/x.pdf" download>dl</Link>
        <Link href="/about" rel="external">ext</Link>
      </RouterProvider>,
    )
    const seen: boolean[] = []
    const record = (e: Event) => {
      seen.push(e.defaultPrevented)
      e.preventDefault() // stop jsdom's "navigation not implemented" noise
    }
    document.addEventListener('click', record)
    try {
      for (const name of ['gh', 'mail', 'dl', 'ext']) {
        fireEvent.click(screen.getByText(name))
      }
    } finally {
      document.removeEventListener('click', record)
    }
    expect(seen).toEqual([false, false, false, false])
    expect(location.pathname).toBe('/')
  })

  it('popstate updates route', () => {
    mount()
    act(() => {
      history.pushState(null, '', '/about')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(routeText()).toContain('about')
  })

  it('hash-only links are plain anchors (not intercepted)', () => {
    render(
      <RouterProvider>
        <Probe />
        <Link href="#foo">jump</Link>
      </RouterProvider>,
    )
    const before = history.length
    let prevented: boolean | undefined
    const record = (e: Event) => {
      prevented = e.defaultPrevented
      e.preventDefault() // stop jsdom's "navigation not implemented" noise
    }
    document.addEventListener('click', record)
    try {
      fireEvent.click(screen.getByText('jump'))
    } finally {
      document.removeEventListener('click', record)
    }
    expect(prevented).toBe(false)
    expect(history.length).toBe(before)
    expect(location.pathname).toBe('/')
  })

  it('Link to an unknown project slug resolves to / without a view/URL mismatch', () => {
    render(
      <RouterProvider>
        <Probe />
        <Link href="/projects/nope">bad</Link>
      </RouterProvider>,
    )
    const before = history.length
    fireEvent.click(screen.getByText('bad'))
    expect(location.pathname).toBe('/')
    expect(history.length).toBe(before)
    expect(routeText()).toContain('home')
  })

  it('navigate to an unknown path from an overlay replaces to /', () => {
    history.replaceState(null, '', '/about')
    mount()
    act(() => navigate('/projects/nope'))
    expect(location.pathname).toBe('/')
    expect(routeText()).toContain('home')
  })

  it('direct-loading an unknown slug renders home without throwing', () => {
    history.replaceState(null, '', '/projects/nope')
    expect(() => mount()).not.toThrow()
    expect(routeText()).toContain('home')
  })

  it('same-origin absolute hrefs still navigate', () => {
    render(
      <RouterProvider>
        <Probe />
        <Link href={`${location.origin}/about`}>abs</Link>
      </RouterProvider>,
    )
    fireEvent.click(screen.getByText('abs'))
    expect(location.pathname).toBe('/about')
  })
})
