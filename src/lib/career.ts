import { experience, site } from '../content'
import type { Role } from '../content/types'
import { zonedYear } from './time'

export const RULER_YEARS = [2023, 2024, 2025, 2026, 2027] as const

/** The latest role starting on or before December of `year`, or null. */
export function roleAt(year: number): Role | null {
  const cutoff = `${year}-12`
  let best: Role | null = null
  for (const r of experience) {
    if (r.start <= cutoff && (!best || r.start > best.start)) best = r
  }
  return best
}

/** The ruler year for `now` in the site's time zone, clamped to the ruler's range. */
export function presentYear(now: Date = new Date()): number {
  const first = RULER_YEARS[0]
  const last = RULER_YEARS[RULER_YEARS.length - 1]
  return Math.min(last, Math.max(first, zonedYear(now, site.timezone)))
}
