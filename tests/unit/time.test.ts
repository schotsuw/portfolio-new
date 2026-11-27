import { describe, expect, it } from 'vitest'
import { zonedParts } from '../../src/lib/time'

describe('zonedParts', () => {
  it('uses daylight time (ADT) in summer', () => {
    const p = zonedParts(new Date('2026-07-01T16:00:00Z'), 'America/Moncton')
    expect(p.h).toBe(13)
    expect(p.m).toBe(0)
    expect(p.s).toBe(0)
    expect(p.abbr).toBe('ADT')
    expect(p.label).toBe('1:00:00 PM')
  })
  it('uses standard time (AST) in winter', () => {
    const p = zonedParts(new Date('2026-12-01T16:00:00Z'), 'America/Moncton')
    expect(p.h).toBe(12)
    expect(p.abbr).toBe('AST')
    expect(p.label).toBe('12:00:00 PM')
  })
  it('reports midnight as h 0 with a 12 AM label', () => {
    const p = zonedParts(new Date('2026-12-01T04:05:09Z'), 'America/Moncton')
    expect(p).toMatchObject({ h: 0, m: 5, s: 9, label: '12:05:09 AM' })
  })
})
