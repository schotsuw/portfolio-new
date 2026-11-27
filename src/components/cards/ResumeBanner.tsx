import { ArrowUpRight } from 'lucide-react'
import { site } from '../../content'
import { cardLinkClass } from './card'

/** Inverted pill: dark on light, light on dark. */
export default function ResumeBanner() {
  return (
    <a
      href={site.resume}
      target="_blank"
      rel="noopener"
      data-card="resume"
      className={`${cardLinkClass} group flex items-center justify-between gap-4 rounded-full bg-ink py-4 pr-4 pl-8 text-page`}
    >
      <span className="flex flex-col">
        <span className="text-title font-semibold">Read my résumé</span>
        <span className="text-caption opacity-70">PDF, opens in a new tab</span>
      </span>
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-page text-ink transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
      >
        <ArrowUpRight size={20} />
      </span>
    </a>
  )
}
