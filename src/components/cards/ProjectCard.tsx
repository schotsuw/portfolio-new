import { useEffect, useId, useRef } from 'react'
import type { Project } from '../../content/types'
import { useReducedMotion } from '../../lib/motion'
import { Link } from '../../lib/router'
import { ART } from '../art'
import GlassChip from '../glass/GlassChip'
import { cardClass, stretchedLinkClass } from './card'

// Heights come from aspect ratio (tall/medium) or content (small), never a fixed px height.
const CARD: Record<Project['cardSize'], string> = {
  tall: 'aspect-[4/5] lg:aspect-[5/11] xl:aspect-[3/5]',
  medium: 'aspect-square md:aspect-[3/2] lg:aspect-square',
  small: '',
}
const PANEL: Record<Project['cardSize'], string> = {
  tall: 'flex-1 min-h-56',
  medium: 'flex-1 min-h-40',
  small: 'aspect-[2/1]',
}
const ART_PAD: Record<Project['cardSize'], string> = {
  tall: 'p-8',
  medium: 'p-6',
  small: 'p-4',
}

function ProjectVideo({ video }: { video: NonNullable<Project['video']> }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (reduced) ref.current?.pause()
  }, [reduced])
  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover"
      src={video.src}
      poster={video.poster}
      autoPlay={!reduced}
      loop
      muted
      playsInline
      aria-hidden="true"
    />
  )
}

export default function ProjectCard({ project }: { project: Project }) {
  const id = useId()
  const descId = `${id}-desc`
  const statusId = `${id}-status`
  const Art = ART[project.art]
  const size = project.cardSize

  return (
    <div data-size={size} data-card={project.slug} className={`${cardClass} group relative flex flex-col gap-5 ${CARD[size]}`}>
      <span id={statusId} className="self-start">
        <GlassChip status={project.status} />
      </span>
      <div className={`relative overflow-hidden rounded-[16px] bg-media text-ink ${PANEL[size]}`}>
        {project.video ? (
          <ProjectVideo video={project.video} />
        ) : (
          <Art className={`absolute inset-0 size-full ${ART_PAD[size]}`} />
        )}
      </div>
      <div data-card-text className="flex flex-col gap-1">
        <h2 className={size === 'small' ? 'text-title font-semibold' : 'text-h3 font-semibold tracking-[-0.02em]'}>
          <Link href={`/projects/${project.slug}`} aria-describedby={`${statusId} ${descId}`} className={stretchedLinkClass}>
            {project.title}
          </Link>
        </h2>
        <p id={descId} className="text-body-sm text-ink-2 text-pretty">
          {project.tagline}
        </p>
      </div>
    </div>
  )
}
