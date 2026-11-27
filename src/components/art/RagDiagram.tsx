import type { ArtProps } from './Monogram'

// Scatter of document embeddings; the query lands among its nearest neighbours.
const POINTS: [number, number][] = [
  [62, 116], [78, 140], [70, 166], [92, 112], [96, 172], [170, 114], [186, 136],
  [176, 168], [158, 176], [196, 158], [84, 128], [164, 132],
]
const NEIGHBOURS: [number, number][] = [
  [110, 126], [142, 150], [116, 160],
]
const QUERY: [number, number] = [126, 140]

/** Retrieval-augmented generation: question, vector search, model, grounded answer. */
export default function RagDiagram({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      role="img"
      aria-label="Diagram: a question is matched to the nearest documents, which ground the model's answer"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* question */}
      <rect x="58" y="22" width="124" height="36" rx="18" />
      <path d="M78 40h52M138 40h22" strokeOpacity={0.45} strokeWidth={3} />
      <path d="M120 58v26" strokeOpacity={0.45} strokeDasharray="2 4" />

      {/* vector space */}
      <rect x="38" y="90" width="164" height="104" rx="20" strokeOpacity={0.25} />
      {POINTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} fill="currentColor" stroke="none" fillOpacity={0.3} />
      ))}
      <circle cx={QUERY[0]} cy={QUERY[1]} r={30} stroke="var(--color-accent)" strokeOpacity={0.5} strokeDasharray="3 4" />
      {NEIGHBOURS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${QUERY[0]} ${QUERY[1]}L${x} ${y}`} stroke="var(--color-accent)" strokeOpacity={0.6} />
          <circle cx={x} cy={y} r={4} stroke="var(--color-accent)" fill="var(--card)" />
        </g>
      ))}
      <circle cx={QUERY[0]} cy={QUERY[1]} r={5} fill="var(--color-accent)" stroke="none" />

      {/* retrieved context flows into the model */}
      <path d="M100 194C100 210 112 214 120 220M140 194C140 210 128 214 120 220" strokeOpacity={0.45} />
      <circle cx="120" cy="234" r="16" />
      <path
        d="M120 225.5c1 5 2.5 6.5 7.5 8.5c-5 2-6.5 3.5-7.5 8.5c-1-5-2.5-6.5-7.5-8.5c5-2 6.5-3.5 7.5-8.5z"
        fill="var(--color-accent)"
        stroke="none"
      />
      <path d="M120 250v10" strokeOpacity={0.45} strokeDasharray="2 4" />

      {/* answer */}
      <rect x="38" y="262" width="164" height="30" rx="15" />
      <path d="M56 277h44" stroke="var(--color-accent)" strokeWidth={3} />
      <path d="M108 277h38M154 277h28" strokeOpacity={0.45} strokeWidth={3} />
    </svg>
  )
}
