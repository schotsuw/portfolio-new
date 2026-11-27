import { useId } from 'react'
import { personal } from '../../content'
import { cardClass } from './card'

const LIFTS = [
  { label: 'Squat', key: 'squat' },
  { label: 'Bench', key: 'bench' },
  { label: 'Deadlift', key: 'deadlift' },
] as const

// Segment tones for the share-of-total bar, lightest to accent.
const TONE = ['bg-ink/25', 'bg-ink/50', 'bg-[var(--color-accent)]']

export default function PersonalityCard() {
  const id = useId()
  const { unit } = personal
  return (
    <section aria-labelledby={`${id}-h`} data-card="personality" className={`${cardClass} @container flex flex-col gap-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-h`} className="text-title font-semibold">
          {personal.title}
        </h2>
        <span className="text-body-sm text-ink-2">Personal bests</span>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        {LIFTS.map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <dt className="text-body-sm text-ink-2">{label}</dt>
            <dd className="font-semibold whitespace-nowrap tabular-nums">
              <span className="text-h3 tracking-[-0.03em] @[340px]:text-h2">{personal[key]}</span>
              <span className="text-body-sm text-ink-2"> {unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div aria-hidden="true" className="flex h-2 gap-1 overflow-hidden rounded-full">
        {LIFTS.map(({ key }, i) => (
          <span key={key} className={`rounded-full ${TONE[i]}`} style={{ flexGrow: personal[key] }} />
        ))}
      </div>

      <dl className="flex items-end justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-col">
          <dt className="text-body-sm text-ink-2">Total</dt>
          <dd className="font-semibold tabular-nums">
            <span className="text-h3">{personal.total}</span>
            <span className="text-body-sm text-ink-2"> {unit}</span>
          </dd>
        </div>
        <div className="flex flex-col text-right">
          <dt className="text-body-sm text-ink-2">Bodyweight</dt>
          <dd className="font-semibold tabular-nums">
            <span className="text-h3">{personal.bodyweight}</span>
            <span className="text-body-sm text-ink-2"> {unit}</span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
