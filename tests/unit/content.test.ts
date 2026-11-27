import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  adjacentProjects,
  allContentItems,
  projectText,
  experience,
  getProject,
  personal,
  projects,
  site,
} from '../../src/content'

// Internal names must never be published, so the denylist is stored only as
// SHA-256 hashes of lowercased, alphanumeric-tokenized 1-3 word phrases.
const sha = (s: string) => createHash('sha256').update(s).digest('hex')

const INTERNAL_NAME_HASHES = new Set([
  'bc908c9329d0707acd632ae65e06f0560ff1666ba349fc002a27316593d0a8d9',
  'dd0cf4ed95b64c54deaf78a11f36e9ad990380df730f1ae34aa7a38afc9ce383',
  '0e38f5975fa59dc4fad45ad6f54110761fb63e2c98159992321a10553afe65d4',
  '97fde70b9ab7dc2f7b3e277db4885233d18ad022cf26dbd51553217e67090ef3',
  '46356cea36963b4533e94d4cec2bef35afae3fa3d2fd96c45c29db62115d97ee',
])

/** True if any 1-, 2- or 3-token n-gram of the text hashes into the denylist. */
function hasDeniedPhrase(text: string, denied: ReadonlySet<string>): boolean {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      if (denied.has(sha(tokens.slice(i, i + n).join(' ')))) return true
    }
  }
  return false
}

describe('content', () => {
  it('slugs are unique and url-safe', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/)
  })

  it('projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'ask-introhive',
      'plant-as-battery',
      'slang-or-not',
      'introhive-mcp',
    ])
    expect(projects.map((p) => p.status)).toEqual([
      'shipped',
      'in-progress',
      'in-progress',
      'shipped',
    ])
  })

  it('no internal Introhive identifiers', () => {
    const ticket = /\bIHS-\d+/
    for (const item of allContentItems()) {
      // Report only the item id, never the matched text.
      expect(ticket.test(item.text), `ticket id in ${item.id}`).toBe(false)
      expect(hasDeniedPhrase(item.text, INTERNAL_NAME_HASHES), `internal name in ${item.id}`).toBe(false)
    }
  })

  it('hash matcher flags planted phrases across separators and n-gram sizes', () => {
    const denied = new Set([sha('forbiddenword'), sha('two words'), sha('a b c')])
    expect(hasDeniedPhrase('x /media/ForbiddenWord.mp4', denied)).toBe(true)
    expect(hasDeniedPhrase('see two-words here', denied)).toBe(true)
    expect(hasDeniedPhrase('A_B/C', denied)).toBe(true)
    expect(hasDeniedPhrase('forbidden word', denied)).toBe(false)
    expect(hasDeniedPhrase('nothing to see', denied)).toBe(false)
  })

  it('lint corpus includes link hrefs and media paths', () => {
    const base = structuredClone(projects[0])
    base.links = [{ label: 'x', href: 'https://example.com/IHS-123/linkword' }]
    base.video = { src: '/media/videoword.mp4', poster: '/media/p.jpg' }
    base.sections = [{ kind: 'image', src: '/img/imageword.png', alt: 'a' }]
    const text = projectText(base)
    expect(text).toMatch(/IHS-123/)
    expect(text).toContain('/media/videoword.mp4')
    expect(text).toContain('/img/imageword.png')
    expect(text).toContain('/media/p.jpg')
    const denied = new Set([sha('videoword'), sha('imageword'), sha('linkword')])
    expect(hasDeniedPhrase(text, denied)).toBe(true)
    expect(/\bIHS-\d+/.test(text)).toBe(true)
  })

  it('MCP project never claims building', () => {
    const item = allContentItems().find((i) => i.id === 'project:introhive-mcp')!
    expect(getProject('introhive-mcp')!.role).toMatch(/test automation/i)
    expect(item.text).not.toMatch(/\bbuilt the mcp\b/i)
  })

  it('no "What I built" heading on Introhive projects', () => {
    for (const slug of ['ask-introhive', 'introhive-mcp']) {
      for (const sec of getProject(slug)!.sections) {
        if ('heading' in sec) expect(sec.heading).not.toMatch(/what i built/i)
      }
    }
  })

  it('fixed facts', () => {
    expect(site.email).toBe('saran.chotsuwan000@gmail.com')
    expect(personal.total).toBe(480)
    expect(personal.squat + personal.bench + personal.deadlift).toBe(personal.total)
    expect(personal.bodyweight).toBe(68)
    expect(
      experience.map((r) => [r.org, r.title, r.start, r.end, r.kind]),
    ).toEqual([
      ['Introhive Services Inc.', 'Associate Machine Learning Engineer', '2026-10', null, 'part-time'],
      ['Introhive Services Inc.', 'Associate Machine Learning Engineer', '2025-05', '2026-04', 'co-op'],
      ['University of New Brunswick', 'Teaching Assistant, Information to Cybersecurity', '2025-01', '2025-04', 'term'],
      ['Sonrai Security Inc.', 'Junior Software Development Engineer in Test', '2024-09', '2024-12', 'term'],
      ['University of New Brunswick', 'Teaching Assistant, Multiple Programming Languages', '2024-01', '2024-04', 'term'],
    ])
  })

  it('adjacentProjects wraps', () => {
    const first = projects[0]
    const last = projects[projects.length - 1]
    expect(adjacentProjects(first.slug).prev.slug).toBe(last.slug)
    expect(adjacentProjects(last.slug).next.slug).toBe(first.slug)
  })
})
