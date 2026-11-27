import type { ArtProps } from './Monogram'

type Token = { w: number; target?: boolean }

const ROW_LITERAL: Token[] = [{ w: 30 }, { w: 44 }, { w: 20 }, { w: 50, target: true }]
const ROW_SLANG: Token[] = [{ w: 36 }, { w: 30 }, { w: 50, target: true }, { w: 40 }, { w: 34 }]

const X0 = 70
const GAP = 8
const H = 20

function layout(tokens: Token[]) {
  let x = X0
  return tokens.map((t) => {
    const out = { ...t, x }
    x += t.w + GAP
    return out
  })
}

const literal = layout(ROW_LITERAL)
const slang = layout(ROW_SLANG)
const litTarget = literal.find((t) => t.target)!
const slangTarget = slang.find((t) => t.target)!
const Y1 = 50
const Y2 = 130

/** The same word in two sentences: once literal (book), once slang (speech bubble, accent). */
export default function SlangPair({ className = '' }: ArtProps) {
  const lx = litTarget.x + litTarget.w / 2
  const sx = slangTarget.x + slangTarget.w / 2
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Diagram: the same word highlighted in two sentences, used literally in one and as slang in the other"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* literal sense: open book */}
      <path d="M26 54c6-3 11-3 16 0v16c-5-3-10-3-16 0zM42 54c5-3 10-3 16 0v16c-6-3-11-3-16 0z" strokeOpacity={0.7} />
      {literal.map((t) => (
        <rect
          key={t.x}
          x={t.x}
          y={Y1}
          width={t.w}
          height={H}
          rx={H / 2}
          strokeOpacity={t.target ? 1 : 0.3}
          strokeWidth={t.target ? 2 : 1.5}
        />
      ))}

      {/* same word, two senses */}
      <path
        d={`M${lx} ${Y1 + H + 6}C${lx} ${Y1 + H + 34} ${sx} ${Y2 - 34} ${sx} ${Y2 - 6}`}
        strokeOpacity={0.45}
        strokeDasharray="2 5"
      />

      {/* slang sense: speech bubble */}
      <path d="M26 128a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-12l-7 6v-6h-1a6 6 0 0 1-6-6z" stroke="var(--color-accent)" />
      {slang.map((t) => (
        <rect
          key={t.x}
          x={t.x}
          y={Y2}
          width={t.w}
          height={H}
          rx={H / 2}
          fill={t.target ? 'var(--color-accent)' : 'none'}
          fillOpacity={t.target ? 0.16 : 0}
          stroke={t.target ? 'var(--color-accent)' : 'currentColor'}
          strokeOpacity={t.target ? 1 : 0.3}
          strokeWidth={t.target ? 2 : 1.5}
        />
      ))}
      <path
        d={`M${sx + slangTarget.w / 2 + 2} ${Y2 - 10}c.6 3 1.4 3.8 4.4 4.4c-3 .6-3.8 1.4-4.4 4.4c-.6-3-1.4-3.8-4.4-4.4c3-.6 3.8-1.4 4.4-4.4z`}
        fill="var(--color-accent)"
        stroke="none"
      />
    </svg>
  )
}
