import { Moon, Sun } from 'lucide-react'
import GlassButton from '../glass/GlassButton'
import { useTheme } from '../../lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <GlassButton
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      onClick={toggle}
      icon={dark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    />
  )
}

export function ThemeCard() {
  return (
    <div data-card="theme" className="flex items-center justify-between gap-4 rounded-2xl bg-card p-5 text-ink">
      <span className="text-ink-2">Light / Dark</span>
      <ThemeToggle />
    </div>
  )
}

export default ThemeCard
