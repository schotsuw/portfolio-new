import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import GlassButton from '../glass/GlassButton'
import { ThemeToggle } from '../cards/ThemeCard'
import { closeOverlay } from '../../lib/router'
import { registerOverlayOpen, type OverlayHandle, useReducedMotion } from '../../lib/motion'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  open: boolean
  label: string
  children: ReactNode
}

export default function Overlay({ open, label, children }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const handleRef = useRef<OverlayHandle | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // Scroll lock and Lenis pause; the opener is remembered at open.
  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement as HTMLElement | null
    const handle = registerOverlayOpen()
    handleRef.current = handle
    return () => {
      handle.release()
      handleRef.current = null
    }
  }, [open])

  // Focus returns to the opener only after the exit animation has finished.
  const restoreFocus = () => {
    const opener = openerRef.current
    openerRef.current = null
    if (opener && opener.isConnected) opener.focus()
  }

  // Move focus into the dialog on open.
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (handleRef.current && !handleRef.current.isTop()) return
      if (e.key === 'Escape') {
        e.preventDefault()
        closeOverlay()
        return
      }
      if (e.key !== 'Tab') return
      const root = ref.current
      if (!root) return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === root || !root.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: '100%' },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: '100%' },
      }

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          data-lenis-prevent
          tabIndex={-1}
          className="fixed inset-0 z-50 overflow-y-auto bg-page text-ink outline-none"
          {...variants}
          transition={{ duration: reduced ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="sticky top-0 z-10 flex justify-end gap-2 p-4">
            <ThemeToggle />
            <GlassButton
              aria-label="Close"
              onClick={() => closeOverlay()}
              icon={<X size={18} aria-hidden="true" />}
            />
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
