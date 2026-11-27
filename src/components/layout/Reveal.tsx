import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../lib/motion'

const RAISE_PX = 24

/**
 * In-view fade/raise for one grid slot. Plays once, the first time the card enters the viewport.
 * Under reduced motion (or with no IntersectionObserver to trigger it) it renders the final state.
 */
export default function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced || typeof IntersectionObserver === 'undefined') {
    return (
      <div data-reveal className={className}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      data-reveal
      className={className}
      // A full `transform` string (not motion's independent `y`) runs as a compositor WAAPI
      // animation, so the reveal costs no main-thread time.
      initial={{ opacity: 0, transform: `translateY(${RAISE_PX}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
