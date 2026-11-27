import type { ArtProps } from './Monogram'

const TOOLS = [30, 84, 138]

/** Model Context Protocol: a client talks to a server, which exposes tools; each tool has a passing check. */
export default function McpDiagram({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="8 20 304 160"
      role="img"
      aria-label="Diagram: an MCP client connects to a server that exposes three tools, each with a passing test"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* client window */}
      <rect x="16" y="62" width="90" height="76" rx="14" />
      <path d="M16 82h90" strokeOpacity={0.25} />
      {[28, 36, 44].map((x) => (
        <circle key={x} cx={x} cy={72} r={2} fill="currentColor" stroke="none" fillOpacity={0.4} />
      ))}
      <path d="M30 100h46M30 114h30" strokeOpacity={0.45} strokeWidth={3} />

      {/* request / response */}
      <path d="M112 94h30m-5-4l5 4l-5 4" />
      <path d="M142 106h-30m5-4l-5 4l5 4" strokeOpacity={0.45} />

      {/* server */}
      <circle cx="172" cy="100" r="24" />
      <circle cx="172" cy="100" r="13" stroke="var(--color-accent)" />
      <circle cx="172" cy="100" r="4" fill="var(--color-accent)" stroke="none" />

      {/* tools */}
      {TOOLS.map((y) => (
        <g key={y}>
          <path d={`M196 100C220 100 220 ${y + 16} 242 ${y + 16}`} strokeOpacity={0.45} />
          <rect x="242" y={y} width="62" height="32" rx="10" />
          <path d={`M254 ${y + 16}h20`} strokeOpacity={0.45} strokeWidth={3} />
          <path d={`M284 ${y + 16.5}l3.5 3.5l7-7.5`} stroke="var(--color-accent)" strokeWidth={2} />
        </g>
      ))}
    </svg>
  )
}
