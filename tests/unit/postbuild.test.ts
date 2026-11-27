// @vitest-environment node
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { allContentItems, projects, site } from '../../src/content'
const mockItems = vi.hoisted(() => ({ override: null as null | { id: string; draft: boolean; text: string }[] }))
vi.mock('../../src/content/index.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/content/index.ts')>()
  return { ...actual, allContentItems: () => mockItems.override ?? actual.allContentItems() }
})

import { isProductionBuild, renderRouteHtml, runPostbuild } from '../../scripts/postbuild'

const TEMPLATE = `<!doctype html><html><head><title>Saran Chotsuwan</title></head><body><div id="root"></div></body></html>`
const meta = {
  title: 'Ask Introhive | Saran',
  description: 'A "quoted" <desc>',
  url: 'https://saranchotsuwan.com/projects/ask-introhive',
  image: 'https://saranchotsuwan.com/og/ask-introhive.png',
}

describe('renderRouteHtml', () => {
  it('replaces title, description, canonical, og and twitter tags', () => {
    const html = renderRouteHtml(
      `<head><title>Old</title><meta name="description" content="old"><link rel="canonical" href="x"><meta property="og:title" content="old"></head>`,
      meta,
    )
    expect(html).toContain('<title>Ask Introhive | Saran</title>')
    expect(html).not.toContain('Old</title>')
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html).toContain('content="A &quot;quoted&quot; &lt;desc&gt;"')
    expect(html).toContain(`<link rel="canonical" href="${meta.url}"`)
    expect(html).toContain('property="og:title" content="Ask Introhive | Saran"')
    expect(html).toContain('property="og:description"')
    expect(html).toContain(`property="og:url" content="${meta.url}"`)
    expect(html).toContain(`property="og:image" content="${meta.image}"`)
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html.match(/property="og:title"/g)).toHaveLength(1)
  })
})

describe('renderRouteHtml special characters', () => {
  it('keeps $& literal and escapes ampersand and quotes', () => {
    const html = renderRouteHtml('<head></head>', { ...meta, description: "Tom's $& R&D <b>" })
    expect(html).toContain('content="Tom\'s $&amp; R&amp;D &lt;b&gt;"')
    expect(html).not.toContain('</head></head>')
  })
})

describe('runPostbuild', () => {
  let dir: string
  beforeEach(async () => {
    mockItems.override = null
    dir = await mkdtemp(join(tmpdir(), 'pb-'))
    await writeFile(join(dir, 'index.html'), TEMPLATE)
  })
  afterEach(() => rm(dir, { recursive: true, force: true }))

  it('writes 4 project files, about, 404, sitemap, robots and og images', async () => {
    await runPostbuild(dir, { production: false })
    expect(projects).toHaveLength(4)
    for (const p of projects) {
      const html = await readFile(join(dir, 'projects', p.slug, 'index.html'), 'utf8')
      expect(html).toContain(`https://saranchotsuwan.com/projects/${p.slug}`)
      expect(html).toContain(`https://saranchotsuwan.com/og/${p.slug}.png`)
      expect(html).not.toContain('application/ld+json')
      const png = await readFile(join(dir, 'og', `${p.slug}.png`))
      expect(png.readUInt32BE(16)).toBe(1200)
      expect(png.readUInt32BE(20)).toBe(630)
    }
    await stat(join(dir, 'about', 'index.html'))
    await stat(join(dir, 'og', 'home.png'))
    await stat(join(dir, 'og', 'about.png'))
    const sitemap = await readFile(join(dir, 'sitemap.xml'), 'utf8')
    expect(sitemap.match(/<loc>/g)).toHaveLength(6)
    expect(sitemap).toContain('<loc>https://saranchotsuwan.com/about</loc>')
    expect(await readFile(join(dir, 'robots.txt'), 'utf8')).toContain('Sitemap: https://saranchotsuwan.com/sitemap.xml')
    const home = await readFile(join(dir, 'index.html'), 'utf8')
    expect(home).toContain('"@type":"Person"')
    expect(home).toContain('"@type":"ProfilePage"')
    expect(home).toContain('Associate Machine Learning Engineer')
  })

  it('404.html has noindex', async () => {
    await runPostbuild(dir, { production: false })
    expect(await readFile(join(dir, '404.html'), 'utf8')).toContain('<meta name="robots" content="noindex">')
  })

  it('throws listing draft ids in production, succeeds otherwise', async () => {
    mockItems.override = [
      { id: 'a', draft: false, text: '' },
      { id: 'project:x', draft: true, text: '' },
    ]
    await expect(runPostbuild(dir, { production: true })).rejects.toThrow('Draft content in production build: project:x')
    await expect(runPostbuild(dir, { production: false })).resolves.toBeUndefined()
  })

  it('production build resolves when no item is draft', async () => {
    mockItems.override = [{ id: 'a', draft: false, text: '' }]
    await expect(runPostbuild(dir, { production: true })).resolves.toBeUndefined()
  })

  it('each project title contains the site name exactly once', async () => {
    await runPostbuild(dir, { production: false })
    for (const p of projects) {
      const html = await readFile(join(dir, 'projects', p.slug, 'index.html'), 'utf8')
      const title = /<title>(.*?)<\/title>/.exec(html)![1]
      expect(title.split('Saran Chotsuwan')).toHaveLength(2)
      expect(html.match(/og:title" content="([^"]*)"/)![1].split('Saran Chotsuwan')).toHaveLength(2)
    }
  })
})

describe('JSON-LD identity comes from site content', () => {
  it('site content holds jobTitle and alumniOf, and they are linted', () => {
    expect(site.jobTitle).toBe('Associate Machine Learning Engineer')
    expect(site.alumniOf).toBe('University of New Brunswick')
    const text = allContentItems().find((i) => i.id === 'site')!.text
    expect(text).toContain(site.jobTitle)
    expect(text).toContain(site.alumniOf)
  })

  it('postbuild emits whatever site content says', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'pb-'))
    await writeFile(join(dir, 'index.html'), TEMPLATE)
    const saved = { jobTitle: site.jobTitle, alumniOf: site.alumniOf }
    site.jobTitle = 'Test Job Title'
    site.alumniOf = 'Test University'
    try {
      await runPostbuild(dir, { production: false })
    } finally {
      Object.assign(site, saved)
    }
    const home = await readFile(join(dir, 'index.html'), 'utf8')
    expect(home).toContain('"jobTitle":"Test Job Title"')
    expect(home).toContain('"alumniOf":{"@type":"CollegeOrUniversity","name":"Test University"}')
    await rm(dir, { recursive: true, force: true })
  })
})

describe('isProductionBuild (draft guard)', () => {
  it('is true only for VERCEL_ENV=production', () => {
    expect(isProductionBuild({ VERCEL: '1', VERCEL_ENV: 'production' })).toBe(true)
    expect(isProductionBuild({ VERCEL: '1', VERCEL_ENV: 'preview' })).toBe(false)
    expect(isProductionBuild({})).toBe(false)
  })

  it('fails closed: on Vercel without VERCEL_ENV it throws instead of skipping the guard', () => {
    expect(() => isProductionBuild({ VERCEL: '1' })).toThrow(/VERCEL_ENV/)
    expect(() => isProductionBuild({ VERCEL: '1', VERCEL_ENV: '' })).toThrow(/VERCEL_ENV/)
  })
})

describe('title separator', () => {
  it('uses " · " before the single site-name suffix on every static route', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'pb-'))
    await writeFile(join(dir, 'index.html'), TEMPLATE)
    await runPostbuild(dir, { production: false })
    const routes = ['about', ...projects.map((p) => `projects/${p.slug}`)]
    for (const r of routes) {
      const html = await readFile(join(dir, r, 'index.html'), 'utf8')
      const title = /<title>(.*?)<\/title>/.exec(html)![1]
      expect(title, r).toMatch(/^.+ · Saran Chotsuwan$/)
      expect(title).not.toMatch(/ [|\u2014\u2013-] /)
    }
    await rm(dir, { recursive: true, force: true })
  })
})

describe('vercel.json', () => {
  it('rewrites non-file paths to /index.html', async () => {
    const cfg = JSON.parse(await readFile('vercel.json', 'utf8'))
    expect(cfg.rewrites).toContainEqual({ source: '/((?!.*\\.).*)', destination: '/index.html' })
  })
})
