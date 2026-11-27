import { ArrowUpRight } from 'lucide-react'
import { site } from '../../content'
import { Link } from '../../lib/router'
import { Monogram } from '../art'
import { cardClass, stretchedLinkClass } from './card'

export default function AboutMini() {
  return (
    <div data-card="about" className={`${cardClass} @container group relative flex flex-col justify-between gap-6`}>
      <div className="flex items-start justify-between">
        <span aria-hidden="true" className="grid size-14 place-items-center overflow-hidden rounded-full bg-media">
          {site.photo ? (
            <img src={site.photo} alt={site.name} className="size-full object-cover" />
          ) : (
            <Monogram className="size-9 text-ink" />
          )}
        </span>
        <ArrowUpRight size={18} aria-hidden="true" className="text-ink-2 transition-colors group-hover:text-ink" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-body font-semibold hyphens-auto @[150px]:text-title">
          <Link href="/about" className={stretchedLinkClass}>
            About me
          </Link>
        </h2>
        <p className="text-body-sm text-ink-2 text-pretty">{site.intro}</p>
      </div>
    </div>
  )
}
