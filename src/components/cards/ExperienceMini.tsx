import { ArrowUpRight } from 'lucide-react'
import { experience } from '../../content'
import { Link } from '../../lib/router'
import { cardClass, cardLinkClass } from './card'

interface OrgSpan {
  org: string
  from: string
  to: string | null
}

/** One row per org, in content order (the content lists newest roles first), spanning its earliest start to its latest end. */
function byOrg(): OrgSpan[] {
  const spans = new Map<string, OrgSpan>()
  for (const r of experience) {
    const s = spans.get(r.org)
    if (!s) {
      spans.set(r.org, { org: r.org, from: r.start, to: r.end })
      continue
    }
    if (r.start < s.from) s.from = r.start
    if (s.to !== null && (r.end === null || r.end > s.to)) s.to = r.end
  }
  return [...spans.values()]
}

function years({ from, to }: OrgSpan): string {
  const a = from.slice(0, 4)
  const b = to === null ? 'Now' : to.slice(0, 4)
  return a === b ? a : `${a}–${b}`
}

export default function ExperienceMini() {
  return (
    <Link href="/about" data-card="experience" className={`${cardLinkClass} ${cardClass} @container group flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 text-body font-semibold hyphens-auto @[150px]:text-title">Experience</h2>
        <ArrowUpRight size={18} aria-hidden="true" className="hidden shrink-0 text-ink-2 transition-colors group-hover:text-ink @[150px]:block" />
      </div>
      <ul className="flex flex-col gap-3">
        {byOrg().map((s) => (
          <li key={s.org} className="flex flex-col">
            <span className="text-body-sm font-medium hyphens-auto">{s.org}</span>
            <span className="text-caption text-ink-2 tabular-nums">{years(s)}</span>
          </li>
        ))}
      </ul>
    </Link>
  )
}
