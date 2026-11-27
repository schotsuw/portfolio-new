import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { allContentItems, projects, site } from '../src/content/index.ts'
import { renderOgPng } from './og.tsx'

export interface RouteMeta {
  title: string
  description: string
  url: string
  image: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function renderRouteHtml(template: string, meta: RouteMeta): string {
  const stripped = template
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, '')
    .replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>\s*/g, '')
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.url)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`,
  ].join('\n    ')
  return stripped.replace('</head>', () => `    ${tags}\n  </head>`)
}

function jsonLd(): string {
  const person = {
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: site.email,
    sameAs: [site.github, site.linkedin],
    jobTitle: site.jobTitle,
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.alumniOf },
  }
  const data = {
    '@context': 'https://schema.org',
    '@graph': [person, { '@type': 'ProfilePage', url: site.url, name: site.name, mainEntity: person }],
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

const ogUrl = (id: string) => `${site.url}/og/${id}.png`

async function writeRoute(distDir: string, route: string, html: string) {
  const dir = join(distDir, route)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'index.html'), html)
}

/**
 * Whether this is a production deploy (the draft guard applies). Fails closed: on Vercel a
 * missing VERCEL_ENV must not silently skip the guard.
 */
export function isProductionBuild(env: Record<string, string | undefined>): boolean {
  if (env.VERCEL && !env.VERCEL_ENV) {
    throw new Error('VERCEL is set but VERCEL_ENV is missing; refusing to skip the draft-content guard')
  }
  return env.VERCEL_ENV === 'production'
}

export async function runPostbuild(distDir: string, opts: { production: boolean }): Promise<void> {
  if (opts.production) {
    const drafts = allContentItems().filter((i) => i.draft).map((i) => i.id)
    if (drafts.length) throw new Error(`Draft content in production build: ${drafts.join(', ')}`)
  }

  const template = await readFile(join(distDir, 'index.html'), 'utf8')

  const pages = [
    {
      id: 'home',
      route: '',
      ogTitle: site.headline,
      tagline: site.intro,
      meta: { title: site.name, description: site.subline, url: `${site.url}/`, image: ogUrl('home') },
    },
    {
      id: 'about',
      route: 'about',
      ogTitle: 'About',
      tagline: site.intro,
      meta: { title: `About · ${site.name}`, description: site.intro, url: `${site.url}/about`, image: ogUrl('about') },
    },
    ...projects.map((p) => ({
      id: p.slug,
      route: `projects/${p.slug}`,
      ogTitle: p.title,
      tagline: p.tagline,
      meta: {
        title: p.og.title,
        description: p.og.description,
        url: `${site.url}/projects/${p.slug}`,
        image: ogUrl(p.slug),
      },
    })),
  ]

  await mkdir(join(distDir, 'og'), { recursive: true })
  for (const page of pages) {
    const png = await renderOgPng({ name: site.name, title: page.ogTitle, tagline: page.tagline })
    await writeFile(join(distDir, 'og', `${page.id}.png`), png)
  }

  const homeHtml = renderRouteHtml(template, pages[0].meta).replace('</head>', () => `    ${jsonLd()}\n  </head>`)
  await writeFile(join(distDir, 'index.html'), homeHtml)
  await writeFile(
    join(distDir, '404.html'),
    homeHtml.replace('</head>', () => '    <meta name="robots" content="noindex">\n  </head>'),
  )
  for (const page of pages.slice(1)) {
    await writeRoute(distDir, page.route, renderRouteHtml(template, page.meta))
  }

  const urls = pages.map((p) => p.meta.url)
  await writeFile(
    join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
  )
  await writeFile(join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPostbuild('dist', { production: isProductionBuild(process.env) }).catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
