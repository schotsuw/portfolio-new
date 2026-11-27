export type Status = 'shipped' | 'in-progress'
export type ArtId = 'rag' | 'mcp' | 'plant' | 'slang'

export type Section =
  | { kind: 'text'; heading: string; body: string }
  | { kind: 'list'; heading: string; items: string[] }
  | { kind: 'stats'; heading: string; items: { label: string; value: string }[] }
  | { kind: 'quote'; text: string }
  | { kind: 'diagram'; art: ArtId; caption: string }
  | { kind: 'image'; src: string; alt: string }

export interface Project {
  slug: string
  title: string
  tagline: string
  status: Status
  role: string
  org: string
  timeline: string
  stack: string[]
  team: string
  cardSize: 'tall' | 'medium' | 'small'
  art: ArtId
  video?: { src: string; poster: string }
  links: { label: string; href: string }[]
  sections: Section[]
  og: { title: string; description: string }
  draft: boolean
}

export interface Role {
  org: string
  title: string
  /** YYYY-MM */
  start: string
  /** YYYY-MM, or null when ongoing */
  end: string | null
  kind: 'co-op' | 'part-time' | 'term'
  summary: string
  draft: boolean
}

export interface Site {
  name: string
  headline: string
  subline: string
  /** One-line intro for the About mini card */
  intro: string
  statusChip: string
  /** schema.org Person jobTitle, from the résumé */
  jobTitle: string
  /** schema.org Person alumniOf university name, from the résumé */
  alumniOf: string
  email: string
  github: string
  linkedin: string
  resume: '/resume.pdf'
  location: 'Fredericton, NB'
  timezone: 'America/Moncton'
  url: 'https://saranchotsuwan.com'
  photo?: string
  draft: boolean
}

export interface StackGroup {
  group: string
  items: string[]
}

export interface Stack {
  groups: StackGroup[]
  draft: boolean
}

export interface Personal {
  squat: number
  bench: number
  deadlift: number
  total: number
  bodyweight: number
  unit: 'kg'
  title: string
  draft: boolean
}
