import type { ReactNode } from 'react'
import type { Status } from '../../content/types'

const LABEL: Record<Status, string> = { shipped: 'Shipped', 'in-progress': 'In progress' }
const DOT: Record<Status, string> = {
  shipped: 'var(--color-status-shipped)',
  'in-progress': 'var(--color-status-progress)',
}

export default function GlassChip({ status, children }: { status: Status; children?: ReactNode }) {
  return (
    <span className="glass-chip-root" style={{ ['--chip-dot' as string]: DOT[status] }}>
      <span className="glass-surface" aria-hidden="true" />
      <span className="glass-content">
        <span className="glass-chip-dot" aria-hidden="true" />
        {children ?? LABEL[status]}
      </span>
      <span className="glass-shadow" aria-hidden="true" />
    </span>
  )
}
