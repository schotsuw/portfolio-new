import { useId } from 'react'
import { stack } from '../../content'
import { cardClass } from './card'

export default function StackCard() {
  const id = useId()
  return (
    <section aria-labelledby={`${id}-h`} data-card="stack" className={`${cardClass} flex flex-col gap-5`}>
      <h2 id={`${id}-h`} className="text-title font-semibold">
        Stack
      </h2>
      {stack.groups.map((g, i) => (
        <div key={g.group} className="flex flex-col gap-2">
          <h3 id={`${id}-${i}`} className="text-body-sm text-ink-2">
            {g.group}
          </h3>
          <ul aria-labelledby={`${id}-${i}`} className="flex flex-wrap gap-2">
            {g.items.map((item) => (
              <li key={item} className="rounded-full border border-line bg-media px-3 py-1 text-body-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
