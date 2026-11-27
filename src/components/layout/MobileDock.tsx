import { FolderKanban, Home, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../lib/motion'

const ITEMS = [
  { id: 'm-home', label: 'Home', Icon: Home },
  { id: 'm-projects', label: 'Projects', Icon: FolderKanban },
  { id: 'm-about', label: 'About', Icon: User },
  { id: 'm-contact', label: 'Contact', Icon: Mail },
] as const

/** Fixed bottom glass dock with scroll-spy. Mobile only. */
export default function MobileDock() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState<string>('m-home')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const { id } of ITEMS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })

  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 gap-1 rounded-full border border-line bg-card/80 p-1.5 shadow-lg backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] lg:hidden"
    >
      {ITEMS.map(({ id, label, Icon }) => {
        const on = active === id
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={on ? 'location' : undefined}
            onClick={() => go(id)}
            className={`grid size-12 place-items-center rounded-full transition-colors aria-[current=location]:bg-ink aria-[current=location]:text-page ${on ? '' : 'text-ink-2'}`}
          >
            <Icon size={20} aria-hidden="true" />
          </button>
        )
      })}
    </nav>
  )
}
