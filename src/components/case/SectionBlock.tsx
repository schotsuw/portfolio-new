import { useId } from 'react'
import type { Section } from '../../content/types'
import { ART } from '../art'

const H2 = 'text-h3 font-semibold tracking-[-0.02em] text-balance'

/** One case-study block, rendered from a typed `Section`. */
export default function SectionBlock({ section }: { section: Section }) {
  const id = useId()
  switch (section.kind) {
    case 'text':
      return (
        <section aria-labelledby={id} className="flex flex-col gap-3">
          <h2 id={id} className={H2}>
            {section.heading}
          </h2>
          <p className="text-body text-ink-2 text-pretty sm:text-title sm:font-normal">{section.body}</p>
        </section>
      )
    case 'list':
      return (
        <section aria-labelledby={id} className="flex flex-col gap-4">
          <h2 id={id} className={H2}>
            {section.heading}
          </h2>
          <ul className="flex flex-col border-t border-line">
            {section.items.map((item) => (
              <li key={item} className="flex gap-4 border-b border-line py-3 text-body text-pretty">
                <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )
    case 'stats':
      return (
        <section aria-labelledby={id} className="flex flex-col gap-4">
          <h2 id={id} className={H2}>
            {section.heading}
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {section.items.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 rounded-[16px] bg-card p-5">
                <dt className="text-body-sm text-ink-2">{s.label}</dt>
                <dd className="text-h2 font-semibold tracking-[-0.03em] tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-[var(--color-accent)] pl-6 text-h3 font-medium tracking-[-0.02em] text-balance">
          <p>{section.text}</p>
        </blockquote>
      )
    case 'diagram': {
      const Art = ART[section.art]
      return (
        <figure className="flex flex-col gap-3">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-media text-ink">
            <Art className="absolute inset-0 size-full p-8 sm:p-12" />
          </div>
          <figcaption className="text-body-sm text-ink-2">{section.caption}</figcaption>
        </figure>
      )
    }
    case 'image':
      return (
        <figure>
          <img
            src={section.src}
            alt={section.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[24px] bg-media object-cover"
          />
        </figure>
      )
  }
}
