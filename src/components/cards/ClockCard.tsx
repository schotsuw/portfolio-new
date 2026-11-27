import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { site } from '../../content'
import { useReducedMotion } from '../../lib/motion'
import { zonedParts } from '../../lib/time'
import { cardClass } from './card'

const C = 60 // dial centre in the 120x120 viewBox
const TICKS = Array.from({ length: 12 }, (_, i) => i)

export default function ClockCard() {
  const reduced = useReducedMotion()
  const [parts, setParts] = useState(() => zonedParts(new Date(), site.timezone))
  const hour = useRef<SVGLineElement>(null)
  const minute = useRef<SVGLineElement>(null)
  const second = useRef<SVGGElement>(null)
  const reducedRef = useRef(reduced)
  const root = useRef<HTMLElement>(null)

  // Positions the hands from the current time; the second hand sweeps unless motion is reduced.
  const place = useRef((now: Date) => {
    const p = zonedParts(now, site.timezone)
    const s = reducedRef.current ? p.s : p.s + now.getMilliseconds() / 1000
    const m = p.m + s / 60
    const h = (p.h % 12) + m / 60
    hour.current?.setAttribute('transform', `rotate(${h * 30} ${C} ${C})`)
    minute.current?.setAttribute('transform', `rotate(${m * 6} ${C} ${C})`)
    second.current?.setAttribute('transform', `rotate(${s * 6} ${C} ${C})`)
    return p
  })

  useLayoutEffect(() => {
    reducedRef.current = reduced
    place.current(new Date())
  }, [reduced])

  // Ticks only while the card is on screen. DesktopGrid and MobileHome both mount a clock and one
  // is always display:none, so without this a hidden copy would run a 60fps loop for nothing.
  useEffect(() => {
    const tick = () => {
      const p = place.current(new Date())
      setParts((prev) => (prev.label === p.label && prev.abbr === p.abbr ? prev : p))
    }
    let stop: (() => void) | undefined
    const start = () => {
      if (stop) return
      tick()
      if (reduced) {
        const id = setInterval(tick, 1000)
        stop = () => clearInterval(id)
      } else {
        let raf = requestAnimationFrame(function loop() {
          tick()
          raf = requestAnimationFrame(loop)
        })
        stop = () => cancelAnimationFrame(raf)
      }
    }
    const halt = () => {
      stop?.()
      stop = undefined
    }

    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      start()
      return halt
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].isIntersecting) start()
      else halt()
    })
    io.observe(el)
    return () => {
      io.disconnect()
      halt()
    }
  }, [reduced])

  return (
    <section ref={root} aria-label={`Local time in ${site.location}`} data-card="clock" className={`${cardClass} @container flex items-center justify-between gap-4`}>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-title font-semibold">{site.location}</h2>
        <p className="text-title font-semibold whitespace-nowrap tabular-nums tracking-[-0.02em] @[300px]:text-h3">
          <time>{parts.label}</time>
        </p>
        <p className="text-body-sm text-ink-2">{parts.abbr}</p>
      </div>
      <svg viewBox="0 0 120 120" aria-hidden="true" className="aspect-square w-20 shrink-0 text-ink @[300px]:w-28">
        <circle cx={C} cy={C} r="57" className="fill-media stroke-ink/10" strokeWidth="1.5" />
        {TICKS.map((i) => (
          <line
            key={i}
            x1={C}
            y1={i % 3 === 0 ? 9 : 11}
            x2={C}
            y2="15"
            stroke="currentColor"
            strokeOpacity={i % 3 === 0 ? 0.7 : 0.3}
            strokeWidth={i % 3 === 0 ? 2 : 1.5}
            strokeLinecap="round"
            transform={`rotate(${i * 30} ${C} ${C})`}
          />
        ))}
        <line ref={hour} x1={C} y1={C + 6} x2={C} y2="34" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line ref={minute} x1={C} y1={C + 8} x2={C} y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <g ref={second}>
          <line x1={C} y1={C + 12} x2={C} y2="16" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <circle cx={C} cy={C} r="3.5" fill="var(--color-accent)" />
      </svg>
    </section>
  )
}
