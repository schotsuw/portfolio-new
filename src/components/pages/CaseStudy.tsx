import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { adjacentProjects, site } from '../../content'
import type { Project, Section } from '../../content/types'
import { Link } from '../../lib/router'
import { ART } from '../art'
import MetaStrip from '../case/MetaStrip'
import SectionBlock from '../case/SectionBlock'
import GlassButton, { GlassFace, glassClass } from '../glass/GlassButton'
import GlassChip from '../glass/GlassChip'
import { GitHubIcon } from '../icons/Brand'

const isGitHub = (href: string) => /^https:\/\/github\.com\//.test(href)

/** Case study body; rendered inside `Overlay`. `project` must be a known project. */
export default function CaseStudy({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const shownSlug = useRef(project.slug)
  const Art = ART[project.art]
  const { prev, next } = adjacentProjects(project.slug)
  // A diagram of the hero's own art would draw it twice: lift its caption under the hero instead.
  const isHeroDiagram = (s: Section) => s.kind === 'diagram' && s.art === project.art
  const heroCaption = project.sections.find(isHeroDiagram)
  const sections = project.sections.filter((s) => !isHeroDiagram(s))

  useEffect(() => {
    document.title = `${project.title} · ${site.name}`
    // Prev/Next swap the project in place: start the new one at the top.
    const scroller = root.current?.closest('[role="dialog"]')
    if (scroller) scroller.scrollTop = 0
  }, [project.slug, project.title])

  // Prev/Next swap the project in place, so move focus to the new h1 to announce the change.
  // Not on first mount: the overlay itself takes focus then.
  useEffect(() => {
    if (shownSlug.current === project.slug) return
    shownSlug.current = project.slug
    heading.current?.focus({ preventScroll: true })
  }, [project.slug])

  return (
    <article ref={root} className="px-5 pb-16 sm:px-8 lg:pb-24">
      <figure className="mx-auto flex max-w-[1100px] flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-media text-ink sm:aspect-[16/9]">
          <Art className="absolute inset-0 size-full p-8 sm:p-14 lg:p-20" />
        </div>
        {heroCaption?.kind === 'diagram' && (
          <figcaption className="text-body-sm text-ink-2">{heroCaption.caption}</figcaption>
        )}
      </figure>

      <div className="mx-auto mt-10 flex max-w-[860px] flex-col gap-12 lg:mt-14">
        <header className="flex flex-col items-start gap-5">
          <GlassChip status={project.status} />
          <h1 ref={heading} tabIndex={-1} className="text-h1 font-semibold text-balance outline-none lg:text-display">{project.title}</h1>
          <p className="max-w-[40ch] text-title text-ink-2 text-pretty lg:text-h3 lg:font-normal">{project.tagline}</p>
        </header>

        <MetaStrip project={project} />

        <div className="flex flex-col gap-14">
          {sections.map((s, i) => (
            <SectionBlock key={`${project.slug}-${i}`} section={s} />
          ))}
        </div>

        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.links.map((l) => (
              <GlassButton
                key={l.href}
                as="a"
                href={l.href}
                target="_blank"
                rel="noopener"
                icon={isGitHub(l.href) ? <GitHubIcon /> : <ArrowUpRight size={18} aria-hidden="true" />}
              >
                {l.label}
              </GlassButton>
            ))}
          </div>
        )}

        <nav aria-label="More projects" className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-start gap-2">
            <span aria-hidden="true" className="text-caption text-ink-2">
              Previous
            </span>
            <Link
              replace
              href={`/projects/${prev.slug}`}
              aria-label={`Previous project: ${prev.title}`}
              className={glassClass()}
            >
              <GlassFace icon={<ArrowLeft size={18} aria-hidden="true" />}>{prev.title}</GlassFace>
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span aria-hidden="true" className="text-caption text-ink-2">
              Next
            </span>
            <Link
              replace
              href={`/projects/${next.slug}`}
              aria-label={`Next project: ${next.title}`}
              className={glassClass()}
            >
              <GlassFace>
                {next.title}
                <ArrowRight size={18} aria-hidden="true" />
              </GlassFace>
            </Link>
          </div>
        </nav>
      </div>
    </article>
  )
}
