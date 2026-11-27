import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { RULER_YEARS, presentYear, roleAt } from '../../src/lib/career'

describe('career', () => {
  // Host zone far ahead of Moncton so a local-year implementation would be a year early.
  const realTZ = process.env.TZ
  beforeEach(() => {
    process.env.TZ = 'Pacific/Auckland'
  })
  afterEach(() => {
    if (realTZ === undefined) delete process.env.TZ
    else process.env.TZ = realTZ
  })

  it('ruler spans 2023 to 2027', () => {
    expect(RULER_YEARS).toEqual([2023, 2024, 2025, 2026, 2027])
  })
  it('picks the latest role starting on or before December of the year', () => {
    expect(roleAt(2025)?.org).toBe('Introhive Services Inc.')
    expect(roleAt(2024)?.org).toBe('Sonrai Security Inc.')
    expect(roleAt(2026)?.kind).toBe('part-time')
    expect(roleAt(2023)).toBeNull()
  })
  it('computes the present year in America/Moncton, not the host zone', () => {
    expect(new Date('2027-01-01T01:30:00Z').getFullYear()).toBe(2027) // host (Auckland) is already in 2027
    // 01:30Z on 1 Jan 2027 is still 21:30 on 31 Dec 2026 in Atlantic time.
    expect(presentYear(new Date('2027-01-01T01:30:00Z'))).toBe(2026)
    // 04:30Z is 00:30 AST on 1 Jan 2027.
    expect(presentYear(new Date('2027-01-01T04:30:00Z'))).toBe(2027)
    // And the other way round: mid-year summer stays put.
    expect(presentYear(new Date('2026-07-01T12:00:00Z'))).toBe(2026)
  })
  it('clamps the present year to the ruler range', () => {
    expect(presentYear(new Date('2020-06-01T12:00:00Z'))).toBe(2023)
    expect(presentYear(new Date('2035-06-01T12:00:00Z'))).toBe(2027)
  })
})
