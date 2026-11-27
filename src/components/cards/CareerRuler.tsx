import { RotateCcw } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { presentYear, roleAt, RULER_YEARS } from '../../lib/career'
import GlassButton from '../glass/GlassButton'
import { cardClass } from './card'

const FIRST = RULER_YEARS[0]
const LAST = RULER_YEARS[RULER_YEARS.length - 1]
const SPAN = LAST - FIRST
const MINOR_PER_YEAR = 4 // quarter ticks between labelled years

const clamp = (y: number) => Math.min(LAST, Math.max(FIRST, y))
const pct = (y: number) => ((y - FIRST) / SPAN) * 100

const MINOR = Array.from({ length: SPAN * MINOR_PER_YEAR + 1 }, (_, i) => i)

export default function CareerRuler() {
  const [present] = useState(() => presentYear())
  const [year, setYear] = useState(present)
  const slider = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const role = roleAt(year)

  const valueText = role ? `${year}: ${role.title}, ${role.org}` : `${year}: before my first role`

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }
    let next: number | undefined
    if (e.key in step) next = year + step[e.key]
    else if (e.key === 'Home') next = FIRST
    else if (e.key === 'End') next = LAST
    if (next === undefined) return
    e.preventDefault()
    setYear(clamp(next))
  }

  const yearFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = (e.clientX - rect.left) / rect.width
    setYear(clamp(Math.round(FIRST + ratio * SPAN)))
  }

  const reset = () => {
    setYear(present)
    slider.current?.focus()
  }

  return (
    <section aria-label="Career timeline" data-card="career" className={`${cardClass} flex flex-col gap-5`}>
      <div className="flex min-h-11 items-start justify-between gap-4">
        <p className="text-h2 font-semibold tabular-nums tracking-[-0.03em]" aria-hidden="true">
          {year}
        </p>
        {year !== present && (
          <GlassButton onClick={reset} icon={<RotateCcw size={16} aria-hidden="true" />}>
            Reset to present
          </GlassButton>
        )}
      </div>

      <div className="flex min-h-12 flex-col" aria-hidden="true">
        {role ? (
          <>
            <p className="text-body font-medium">{role.title}</p>
            <p className="text-body-sm text-ink-2">{role.org}</p>
          </>
        ) : (
          <p className="text-body text-ink-2">Before my first role</p>
        )}
      </div>

      <div
        ref={slider}
        role="slider"
        tabIndex={0}
        aria-label="Career year"
        aria-valuemin={FIRST}
        aria-valuemax={LAST}
        aria-valuenow={year}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture?.(e.pointerId)
          yearFromPointer(e)
        }}
        onPointerMove={(e) => dragging.current && yearFromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className="relative cursor-ew-resize touch-pan-y rounded-[8px] px-2 pt-2 pb-7 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        <div className="relative h-8">
          {MINOR.map((i) => {
            const major = i % MINOR_PER_YEAR === 0
            return (
              <span
                key={i}
                className={`absolute bottom-0 w-px -translate-x-1/2 bg-ink ${major ? 'h-6 opacity-60' : 'h-3 opacity-25'}`}
                style={{ left: `${(i / (SPAN * MINOR_PER_YEAR)) * 100}%` }}
              />
            )
          })}
          <span
            className="absolute bottom-0 h-8 w-[3px] -translate-x-1/2 rounded-full bg-[var(--color-accent)] transition-[left] duration-300 ease-out motion-reduce:transition-none"
            style={{ left: `${pct(year)}%` }}
          />
        </div>
        {RULER_YEARS.map((y) => (
          <span
            key={y}
            className={`absolute bottom-1 -translate-x-1/2 text-caption tabular-nums ${y === year ? 'text-ink' : 'text-ink-2'}`}
            style={{ left: `calc(0.5rem + (100% - 1rem) * ${pct(y) / 100})` }}
          >
            {y}
          </span>
        ))}
      </div>
    </section>
  )
}
