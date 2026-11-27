// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (p: string) => readFileSync(p, 'utf8')

describe('vercel.json', () => {
  const cfg = JSON.parse(read('vercel.json'))

  it('keeps the SPA rewrite', () => {
    expect(cfg.rewrites).toEqual([{ source: '/((?!.*\\.).*)', destination: '/index.html' }])
  })

  it.each(['/assets/(.*)', '/fonts/(.*)'])('serves %s as long-lived immutable', (source) => {
    const entry = cfg.headers.find((h: { source: string }) => h.source === source)
    expect(entry?.headers).toContainEqual({ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' })
  })
})

describe('Node version and CI', () => {
  const ci = read('.github/workflows/ci.yml')
  const pkg = JSON.parse(read('package.json'))
  const major = /node-version:\s*(\d+)\s*$/m.exec(ci)?.[1]

  it('pins a numeric Node major in CI that matches package.json engines', () => {
    expect(major).toBeDefined()
    expect(pkg.engines.node).toBe(`>=${major}`)
  })

  it('cancels superseded runs per ref and has a job timeout', () => {
    expect(ci).toMatch(/^concurrency:\s*\n\s+group:\s*.*github\.ref.*\n\s+cancel-in-progress:\s*true/m)
    expect(ci).toMatch(/^\s+timeout-minutes:\s*\d+/m)
  })

  it('runs push only for main and build, so PR branches do not run twice', () => {
    expect(ci).toMatch(/push:\s*\n\s+branches:\s*\[main, build\]/)
    expect(ci).toMatch(/pull_request:/)
  })
})
