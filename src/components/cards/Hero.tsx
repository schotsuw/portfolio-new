import { FileText } from 'lucide-react'
import { Fragment, useState } from 'react'
import { site } from '../../content'
import { useReducedMotion } from '../../lib/motion'
import { Monogram } from '../art'
import GlassButton from '../glass/GlassButton'
import GlassChip from '../glass/GlassChip'
import CopyEmail from './CopyEmail'

const CYCLE = ['var(--cycle-1)', 'var(--cycle-2)', 'var(--cycle-3)']

function Headline() {
  const reduced = useReducedMotion()
  const words = site.headline.split(' ')
  const [tone, setTone] = useState<(number | undefined)[]>(() => words.map(() => undefined))

  const bump = (i: number) =>
    setTone((t) => t.map((v, j) => (j === i ? ((v ?? -1) + 1) % CYCLE.length : v)))

  return (
    <h1 aria-label={site.headline} className="text-h1 font-semibold text-balance xl:text-display">
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {i > 0 && ' '}
          <span
            aria-hidden="true"
            onMouseEnter={reduced ? undefined : () => bump(i)}
            style={{ color: tone[i] === undefined ? undefined : CYCLE[tone[i]!] }}
            className="transition-colors duration-300"
          >
            {w}
          </span>
        </Fragment>
      ))}
    </h1>
  )
}

export default function Hero({ showMonogram = true }: { showMonogram?: boolean }) {
  return (
    <section aria-label="Introduction" data-card="hero" className="flex flex-col gap-6 rounded-[24px] p-6 text-ink">
      {showMonogram && <Monogram className="size-16 text-ink" />}
      <div className="flex flex-col gap-4">
        <Headline />
        <p className="max-w-[60ch] text-title text-ink-2 text-pretty lg:text-body xl:text-title">{site.subline}</p>
      </div>
      <div>
        <GlassChip status="shipped">{site.statusChip}</GlassChip>
      </div>
      <div className="flex flex-wrap gap-3">
        <GlassButton
          as="a"
          href={site.resume}
          target="_blank"
          rel="noopener"
          tint="accent"
          icon={<FileText size={18} aria-hidden="true" />}
        >
          Résumé
        </GlassButton>
        <CopyEmail />
      </div>
    </section>
  )
}
