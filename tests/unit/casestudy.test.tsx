import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import About from '../../src/components/pages/About'
import CaseStudy from '../../src/components/pages/CaseStudy'
import { experience, getProject, site, type Project, type Section } from '../../src/content'
import { navigate } from '../../src/lib/router'
import { ThemeProvider } from '../../src/lib/theme'

beforeEach(() => {
  history.replaceState(null, '', '/')
  document.title = 'Saran Chotsuwan'
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
  vi.restoreAllMocks()
})

const app = () =>
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )

const project = (slug: string): Project => {
  const p = getProject(slug)
  if (!p) throw new Error(`fixture slug missing: ${slug}`)
  return p
}

describe('App routing to overlays', () => {
  it('route /projects/ask-introhive opens dialog labelled Ask Introhive', () => {
    history.replaceState(null, '', '/projects/ask-introhive')
    app()
    const dialog = screen.getByRole('dialog', { name: 'Ask Introhive' })
    expect(within(dialog).getByRole('heading', { level: 1, name: 'Ask Introhive' })).toBeInTheDocument()
    expect(document.title).toBe('Ask Introhive · Saran Chotsuwan')
    // Home stays rendered underneath.
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('route /about opens the About dialog', () => {
    history.replaceState(null, '', '/about')
    app()
    expect(screen.getByRole('dialog', { name: 'About' })).toBeInTheDocument()
  })

  it('home has no dialog; unknown slug renders home without a dialog', () => {
    history.replaceState(null, '', '/projects/nope')
    app()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('restores the home title when the overlay closes', async () => {
    history.replaceState(null, '', '/projects/slang-or-not')
    app()
    expect(document.title).toBe('Slang-or-Not · Saran Chotsuwan')
    act(() => navigate('/', { replace: true }))
    expect(document.title).toBe(site.name)
  })

  it('Next from introhive-mcp goes to ask-introhive, using replace', async () => {
    history.replaceState(null, '', '/projects/introhive-mcp')
    app()
    const push = vi.spyOn(history, 'pushState')
    const replace = vi.spyOn(history, 'replaceState')
    const dialog = screen.getByRole('dialog', { name: 'Introhive MCP' })
    await userEvent.click(within(dialog).getByRole('link', { name: 'Next project: Ask Introhive' }))
    expect(location.pathname).toBe('/projects/ask-introhive')
    expect(push).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalled()
    expect(await screen.findByRole('dialog', { name: 'Ask Introhive' })).toBeInTheDocument()
    expect(document.title).toBe('Ask Introhive · Saran Chotsuwan')
  })

  it('Prev/Next then Close from a direct load lands on /', async () => {
    history.replaceState(null, '', '/projects/introhive-mcp')
    app()
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Introhive MCP' })).getByRole('link', { name: 'Next project: Ask Introhive' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Ask Introhive' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(location.pathname).toBe('/')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('Prev/Next then Close after opening from home goes back to /', async () => {
    app()
    act(() => navigate('/projects/introhive-mcp'))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Introhive MCP' })).getByRole('link', { name: 'Next project: Ask Introhive' }),
    )
    await userEvent.click(within(await screen.findByRole('dialog', { name: 'Ask Introhive' })).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(location.pathname).toBe('/'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('Prev/Next moves focus to the new project heading', async () => {
    history.replaceState(null, '', '/projects/introhive-mcp')
    app()
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    const first = screen.getByRole('dialog', { name: 'Introhive MCP' })
    expect(within(first).getByRole('heading', { level: 1 })).not.toHaveFocus()
    await userEvent.click(within(first).getByRole('link', { name: 'Next project: Ask Introhive' }))
    const h1 = within(await screen.findByRole('dialog', { name: 'Ask Introhive' })).getByRole('heading', { level: 1 })
    expect(h1).toHaveAttribute('tabindex', '-1')
    await waitFor(() => expect(h1).toHaveFocus())
    // Must not scroll the dialog back down after the scrollTop reset.
    const call = focus.mock.calls.findIndex((_c, i) => focus.mock.contexts[i] === h1)
    expect(focus.mock.calls[call][0]).toEqual({ preventScroll: true })
  })
})

describe('CaseStudy', () => {
  const fixture: Section[] = [
    { kind: 'text', heading: 'Fixture text', body: 'Body paragraph.' },
    { kind: 'list', heading: 'Fixture list', items: ['Alpha item', 'Beta item'] },
    { kind: 'stats', heading: 'Fixture stats', items: [{ label: 'Examples', value: '12,712' }] },
    { kind: 'quote', text: 'A fixture quote.' },
    { kind: 'diagram', art: 'slang', caption: 'Fixture caption.' },
    { kind: 'image', src: '/fixture.png', alt: 'Fixture image' },
  ]

  it('each Section kind renders', () => {
    render(<CaseStudy project={{ ...project('slang-or-not'), sections: fixture }} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Fixture text' })).toBeInTheDocument()
    expect(screen.getByText('Body paragraph.')).toBeInTheDocument()
    const list = screen.getByRole('heading', { level: 2, name: 'Fixture list' }).closest('section')!.querySelector('ul')!
    expect(list).not.toHaveAttribute('aria-labelledby')
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha item', 'Beta item'])
    expect(screen.getByRole('heading', { level: 2, name: 'Fixture stats' })).toBeInTheDocument()
    expect(screen.getByText('12,712')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText('A fixture quote.').closest('blockquote')).not.toBeNull()
    expect(screen.getByText('Fixture caption.').closest('figure')).not.toBeNull()
    expect(screen.getByRole('img', { name: 'Fixture image' })).toHaveAttribute('src', '/fixture.png')
  })

  it('draws the hero art once; a same-art diagram becomes the hero caption', () => {
    const p = project('ask-introhive')
    const diagram = p.sections.find((s) => s.kind === 'diagram' && s.art === p.art)
    if (diagram?.kind !== 'diagram') throw new Error('fixture: ask-introhive needs a rag diagram section')
    render(<CaseStudy project={p} />)
    expect(screen.getAllByRole('img', { name: /question is matched to the nearest documents/ })).toHaveLength(1)
    const caption = screen.getByText(diagram.caption)
    expect(caption.tagName).toBe('FIGCAPTION')
    expect(caption.closest('figure')).toBe(screen.getByRole('img', { name: /nearest documents/ }).closest('figure'))
  })

  it('renders a diagram with a different art id normally', () => {
    const p = { ...project('ask-introhive'), sections: [{ kind: 'diagram', art: 'slang', caption: 'Other art.' } as Section] }
    const { container } = render(<CaseStudy project={p} />)
    expect(screen.getByText('Other art.').closest('figure')?.querySelectorAll('svg')).toHaveLength(1)
    expect(container.querySelectorAll('figure')).toHaveLength(2)
  })

  it('shows a meta strip with the exact labels and values', () => {
    // ask-introhive has no stats section, so every dt/dd belongs to the strip.
    const p = project('ask-introhive')
    render(<CaseStudy project={p} />)
    const terms = screen.getAllByRole('term').map((t) => t.textContent)
    expect(terms).toEqual(['Org', 'My role', 'Timeline', 'Stack', 'Team'])
    const defs = screen.getAllByRole('definition').map((d) => d.textContent)
    expect(defs).toEqual([p.org, p.role, p.timeline, p.stack.join(' · '), p.team])
  })

  it('renders project links as new-tab anchors', () => {
    render(<CaseStudy project={project('slang-or-not')} />)
    const gh = screen.getByRole('link', { name: 'GitHub' })
    expect(gh).toHaveAttribute('href', 'https://github.com/schotsuw/slang-or-not')
    expect(gh).toHaveAttribute('target', '_blank')
    expect(gh.getAttribute('rel')).toContain('noopener')
  })

  it('labels Prev/Next with the adjacent project titles', () => {
    render(<CaseStudy project={project('ask-introhive')} />)
    expect(screen.getByRole('link', { name: 'Previous project: Introhive MCP' })).toHaveAttribute(
      'href',
      '/projects/introhive-mcp',
    )
    expect(screen.getByRole('link', { name: 'Next project: Plant as Battery' })).toHaveAttribute(
      'href',
      '/projects/plant-as-battery',
    )
  })
})

describe('About', () => {
  it('sets the document title with the shared separator', () => {
    render(<About />)
    expect(document.title).toBe('About · Saran Chotsuwan')
  })

  it('shows all 4 roles in order newest first', () => {
    // Sorted by start date, not by content order.
    const original = [...experience]
    experience.reverse()
    try {
      render(<About />)
    } finally {
      experience.splice(0, experience.length, ...original)
    }
    const list = screen.getByRole('list', { name: 'Experience' })
    const roles = Array.from(list.children) as HTMLElement[]
    const label = (li: HTMLElement) => {
      const h = within(li).getByRole('heading', { level: 3 })
      return `${h.textContent}, ${h.nextElementSibling?.textContent}`
    }
    expect(roles.map(label)).toEqual([
      'Associate Machine Learning Engineer, Introhive Services Inc.',
      'Teaching Assistant, Information to Cybersecurity, University of New Brunswick',
      'Junior Software Development Engineer in Test, Sonrai Security Inc.',
      'Teaching Assistant, Multiple Programming Languages, University of New Brunswick',
    ])
    // Introhive keeps both stints, newest first.
    expect(roles[0]).toHaveTextContent(/Oct 2026 – present.*May 2025 – Apr 2026/)
  })

  it('shows the Monogram when site.photo is unset', () => {
    render(<About />)
    expect(screen.getByRole('img', { name: 'SC monogram' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: site.name })).toBeNull()
  })

  it('shows the photo when site.photo is set', () => {
    const before = site.photo
    site.photo = '/photo.jpg'
    try {
      render(<About />)
      expect(screen.getByRole('img', { name: site.name })).toHaveAttribute('src', '/photo.jpg')
      expect(screen.queryByRole('img', { name: 'SC monogram' })).toBeNull()
    } finally {
      site.photo = before
    }
  })

  it('has résumé, email, LinkedIn and GitHub actions plus stack chips', () => {
    render(<About />)
    expect(screen.getByRole('link', { name: /Résumé/ })).toHaveAttribute('href', site.resume)
    expect(screen.getByRole('link', { name: /Email/ })).toHaveAttribute('href', `mailto:${site.email}`)
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', site.linkedin)
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', site.github)
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })
})
