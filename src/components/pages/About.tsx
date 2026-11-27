import { FileText, Mail } from 'lucide-react'
import { Fragment, useEffect, useId } from 'react'
import { experience, site, stack } from '../../content'
import type { Role } from '../../content/types'
import { Monogram } from '../art'
import GlassButton from '../glass/GlassButton'
import { GitHubIcon, LinkedInIcon } from '../icons/Brand'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const KIND: Record<Role['kind'], string | null> = { 'co-op': 'Co-op', 'part-time': 'Part-time', term: null }

function month(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}
const span = (r: Role) => `${month(r.start)} – ${r.end === null ? 'present' : month(r.end)}`

interface Position {
  org: string
  title: string
  /** Newest first. */
  stints: Role[]
}

/** Same org + title is one position with several stints (e.g. co-op then part-time). Newest first by start. */
function positions(): Position[] {
  const byKey = new Map<string, Position>()
  for (const r of experience) {
    const key = `${r.org}\u0000${r.title}`
    const p = byKey.get(key) ?? { org: r.org, title: r.title, stints: [] }
    p.stints.push(r)
    byKey.set(key, p)
  }
  const list = [...byKey.values()]
  for (const p of list) p.stints.sort((a, b) => b.start.localeCompare(a.start))
  return list.sort((a, b) => b.stints[0].start.localeCompare(a.stints[0].start))
}

const H2 = 'text-caption font-medium tracking-[0.08em] text-ink-2 uppercase'

export default function About() {
  const id = useId()

  useEffect(() => {
    document.title = `About · ${site.name}`
  }, [])

  return (
    <article className="px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-[860px] flex-col gap-16 pt-4 lg:pt-10">
        <header className="flex flex-col items-start gap-6">
          <span className="grid size-24 place-items-center overflow-hidden rounded-full bg-media lg:size-28">
            {site.photo ? (
              <img src={site.photo} alt={site.name} className="size-full object-cover" />
            ) : (
              <Monogram className="size-14 text-ink lg:size-16" />
            )}
          </span>
          <div className="flex flex-col gap-4">
            <h1 className="text-h1 font-semibold text-balance lg:text-display">{site.name}</h1>
            <p className="max-w-[44ch] text-title text-pretty lg:text-h3 lg:font-normal">{site.intro}</p>
            <p className="max-w-[60ch] text-body text-ink-2 text-pretty">{site.subline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GlassButton
              as="a"
              href={site.resume}
              target="_blank"
              rel="noopener"
              tint="accent"
              icon={<FileText size={18} aria-hidden="true" />}
            >
              Résumé
            </GlassButton>
            <GlassButton as="a" href={`mailto:${site.email}`} icon={<Mail size={18} aria-hidden="true" />}>
              Email
            </GlassButton>
            <GlassButton as="a" href={site.linkedin} target="_blank" rel="noopener" icon={<LinkedInIcon />}>
              LinkedIn
            </GlassButton>
            <GlassButton as="a" href={site.github} target="_blank" rel="noopener" icon={<GitHubIcon />}>
              GitHub
            </GlassButton>
          </div>
        </header>

        <section aria-labelledby={`${id}-exp`} className="flex flex-col gap-6">
          <h2 id={`${id}-exp`} className={H2}>
            Experience
          </h2>
          <ol aria-labelledby={`${id}-exp`} className="flex flex-col border-t border-line">
            {positions().map((p) => (
              <li
                key={`${p.org}-${p.title}`}
                className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-7 md:grid-cols-[168px_1fr] md:gap-y-5"
              >
                {p.stints.map((r, i) => (
                  <Fragment key={r.start}>
                    <p className="flex flex-col pt-1 text-body-sm tabular-nums">
                      <span>{span(r)}</span>
                      {KIND[r.kind] && <span className="text-ink-2">{KIND[r.kind]}</span>}
                    </p>
                    <div className="flex flex-col gap-2">
                      {i === 0 && (
                        <div className="flex flex-col">
                          <h3 className="text-title font-semibold text-balance">{p.title}</h3>
                          <p className="text-body text-ink-2">{p.org}</p>
                        </div>
                      )}
                      <p className="max-w-[60ch] text-body text-pretty">{r.summary}</p>
                    </div>
                  </Fragment>
                ))}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${id}-stack`} className="flex flex-col gap-6">
          <h2 id={`${id}-stack`} className={H2}>
            Stack
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {stack.groups.map((g, i) => (
              <div key={g.group} className="flex flex-col gap-3">
                <h3 id={`${id}-g${i}`} className="text-body-sm font-medium">
                  {g.group}
                </h3>
                <ul aria-labelledby={`${id}-g${i}`} className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="rounded-full border border-line bg-card px-3 py-1 text-body-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}
