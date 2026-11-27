import { experience } from './experience'
import { personal } from './personal'
import { projects } from './projects'
import { site } from './site'
import { stack } from './stack'
import type { Project, Section } from './types'

export * from './types'
export { experience, personal, projects, site, stack }

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function adjacentProjects(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i < 0) throw new Error(`Unknown project slug: ${slug}`)
  const n = projects.length
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] }
}

function sectionText(s: Section): string {
  switch (s.kind) {
    case 'text':
      return `${s.heading} ${s.body}`
    case 'list':
      return `${s.heading} ${s.items.join(' ')}`
    case 'stats':
      return `${s.heading} ${s.items.map((i) => `${i.label} ${i.value}`).join(' ')}`
    case 'quote':
      return s.text
    case 'diagram':
      return s.caption
    case 'image':
      return `${s.alt} ${s.src}`
  }
}

/** All text of a project, including link hrefs and media paths, for linting. */
export function projectText(p: Project): string {
  return [
    p.title, p.tagline, p.role, p.org, p.timeline, p.team,
    p.stack.join(' '),
    p.links.map((l) => `${l.label} ${l.href}`).join(' '),
    p.video ? `${p.video.src} ${p.video.poster}` : '',
    p.og.title, p.og.description,
    ...p.sections.map(sectionText),
  ].join(' ')
}

/** Every user-facing string, flattened per item, for linting and the draft gate. */
export function allContentItems(): { id: string; draft: boolean; text: string }[] {
  const items: { id: string; draft: boolean; text: string }[] = []
  items.push({
    id: 'site',
    draft: site.draft,
    text: [site.name, site.headline, site.subline, site.intro, site.statusChip, site.jobTitle, site.alumniOf, site.location, site.email, site.github, site.linkedin, site.photo ?? ''].join(' '),
  })
  for (const p of projects) {
    items.push({
      id: `project:${p.slug}`,
      draft: p.draft,
      text: projectText(p),
    })
  }
  experience.forEach((r, i) =>
    items.push({
      id: `role:${i}`,
      draft: r.draft,
      text: [r.org, r.title, r.summary].join(' '),
    }),
  )
  items.push({
    id: 'stack',
    draft: stack.draft,
    text: stack.groups.map((g) => `${g.group} ${g.items.join(' ')}`).join(' '),
  })
  items.push({ id: 'personal', draft: personal.draft, text: personal.title })
  return items
}
