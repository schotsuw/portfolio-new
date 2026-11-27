import type { Project } from '../../content/types'

/** Key facts for a case study, as a definition list. Labels are fixed UI copy. */
export default function MetaStrip({ project }: { project: Project }) {
  const rows: [string, string][] = [
    ['Org', project.org],
    ['My role', project.role],
    ['Timeline', project.timeline],
    ['Stack', project.stack.join(' · ')],
    ['Team', project.team],
  ]
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-6 border-y border-line py-6 md:grid-cols-3">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className={`flex min-w-0 flex-col gap-1.5 ${label === 'My role' ? 'md:col-span-2' : ''}`}
        >
          <dt className="text-caption font-medium tracking-[0.08em] text-ink-2 uppercase">{label}</dt>
          <dd className="text-body-sm text-pretty">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
