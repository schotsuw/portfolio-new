export interface ZonedParts {
  /** 0-23 */
  h: number
  m: number
  s: number
  /** e.g. '2:30:15 PM' */
  label: string
  /** e.g. 'AST' | 'ADT' */
  abbr: string
}

const cache = new Map<string, Intl.DateTimeFormat>()

function formatter(tz: string): Intl.DateTimeFormat {
  let f = cache.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h12',
      timeZoneName: 'short',
    })
    cache.set(tz, f)
  }
  return f
}

/** Wall-clock parts of `date` in time zone `tz`. */
export function zonedParts(date: Date, tz: string): ZonedParts {
  const parts = formatter(tz).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  const h12 = Number(get('hour')) % 12
  const pm = get('dayPeriod').toUpperCase() === 'PM'
  const m = Number(get('minute'))
  const s = Number(get('second'))
  const period = pm ? 'PM' : 'AM'
  return {
    h: h12 + (pm ? 12 : 0),
    m,
    s,
    label: `${h12 === 0 ? 12 : h12}:${get('minute')}:${get('second')} ${period}`,
    abbr: get('timeZoneName'),
  }
}

/** Calendar year of `date` in time zone `tz`. */
export function zonedYear(date: Date, tz: string): number {
  const year = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric' }).format(date)
  return Number(year)
}
