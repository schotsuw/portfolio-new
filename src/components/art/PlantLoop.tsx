import type { ArtProps } from './Monogram'

const CX = 160
const CY = 120
const R = 80
const GAP = 24 // degrees left open around each station

const rad = (d: number) => (d * Math.PI) / 180
const pt = (deg: number) => [CX + R * Math.cos(rad(deg)), CY + R * Math.sin(rad(deg))] as const
const f = (n: number) => n.toFixed(1)

// Four clockwise arcs between the stations at N, E, S, W, each ending in an arrowhead.
const ARCS = [-90, 0, 90, 180].map((station) => {
  const from = station + GAP
  const to = station + 90 - GAP
  const [x1, y1] = pt(from)
  const [x2, y2] = pt(to)
  // clockwise tangent at the end point
  const tx = -Math.sin(rad(to))
  const ty = Math.cos(rad(to))
  const head = (sign: number) => {
    const a = rad(sign * 32)
    const dx = tx * Math.cos(a) - ty * Math.sin(a)
    const dy = tx * Math.sin(a) + ty * Math.cos(a)
    return `M${f(x2)} ${f(y2)}l${f(-dx * 7)} ${f(-dy * 7)}`
  }
  return {
    arc: `M${f(x1)} ${f(y1)}A${R} ${R} 0 0 1 ${f(x2)} ${f(y2)}`,
    head: `${head(1)}${head(-1)}`,
  }
})

/** Feedback loop: Raspberry Pi → grow lights → plant → forecast → back to the Pi. */
export default function PlantLoop({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="40 12 240 216"
      role="img"
      aria-label="Diagram: a Raspberry Pi drives the grow lights, the plant grows, and a forecast feeds back into the Pi"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ARCS.map(({ arc, head }) => (
        <g key={arc}>
          <path d={arc} strokeOpacity={0.35} />
          <path d={head} stroke="var(--color-accent)" strokeWidth={2} />
        </g>
      ))}

      {/* N: forecast (sun behind a cloud) */}
      <circle cx="152" cy="34" r="8" fill="var(--color-accent)" stroke="none" fillOpacity={0.85} />
      <path d="M150 52h24a8 8 0 0 0 0-16a11 11 0 0 0-21-2a9 9 0 0 0-3 18z" fill="var(--card)" />

      {/* E: grow light bar with rays */}
      <rect x="222" y="104" width="36" height="9" rx="4.5" />
      <path d="M230 120l-3 8M240 120v9M250 120l3 8" stroke="var(--color-accent)" strokeWidth={2} />

      {/* S: potted plant */}
      <path d="M148 196h24l-3 18h-18z" />
      <path d="M160 196v-12" />
      <path d="M160 188c0-8 6-12 13-12c0 8-6 12-13 12z" fill="var(--color-accent)" fillOpacity={0.18} stroke="var(--color-accent)" />
      <path d="M160 192c0-7-5-10-11-10c0 7 5 10 11 10z" />

      {/* W: Raspberry Pi board */}
      <rect x="60" y="104" width="44" height="32" rx="5" />
      {[66, 72, 78, 84, 90, 96].map((x) => (
        <circle key={x} cx={x} cy={110} r={1.3} fill="currentColor" stroke="none" fillOpacity={0.55} />
      ))}
      <rect x="72" y="118" width="12" height="12" rx="2" strokeOpacity={0.6} />
      <path d="M90 124h8M90 129h6" strokeOpacity={0.45} />
    </svg>
  )
}
