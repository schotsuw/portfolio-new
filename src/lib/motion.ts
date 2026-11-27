import { useEffect, useState, useSyncExternalStore } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useReducedMotion } from 'motion/react'

export { useReducedMotion }

// Overlay-open store: stack of open overlays, ref-counted body scroll lock,
// and Lenis pause while any overlay is open.
const overlayStack: symbol[] = []
let originalOverflow = ''
let lenisInstance: Lenis | null = null
let lenisUsers = 0
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
const getLenis = () => lenisInstance
const getServerLenis = () => null

function sync() {
  if (!lenisInstance) return
  if (overlayStack.length > 0) lenisInstance.stop()
  else lenisInstance.start()
}

export interface OverlayHandle {
  release(): void
  isTop(): boolean
}

/** Called by Overlay while open. Locks body scroll on 0->1, restores on 1->0. */
export function registerOverlayOpen(): OverlayHandle {
  const token = Symbol('overlay')
  if (overlayStack.length === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  overlayStack.push(token)
  sync()
  return {
    release() {
      const i = overlayStack.indexOf(token)
      if (i === -1) return
      overlayStack.splice(i, 1)
      if (overlayStack.length === 0) document.body.style.overflow = originalOverflow
      sync()
    },
    isTop: () => overlayStack[overlayStack.length - 1] === token,
  }
}

function isDesktop(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return (
    window.matchMedia('(min-width: 1024px)').matches && window.matchMedia('(pointer: fine)').matches
  )
}

const DESKTOP_QUERIES = ['(min-width: 1024px)', '(pointer: fine)']

/** Tracks the desktop media queries live so Lenis follows viewport / pointer changes. */
function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(isDesktop)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mqs = DESKTOP_QUERIES.map((q) => window.matchMedia(q))
    const update = () => setDesktop(isDesktop())
    mqs.forEach((mq) => mq.addEventListener?.('change', update))
    update()
    return () => mqs.forEach((mq) => mq.removeEventListener?.('change', update))
  }, [])
  return desktop
}

export function useLenis(): Lenis | null {
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()
  const lenis = useSyncExternalStore(subscribe, getLenis, getServerLenis)

  useEffect(() => {
    if (reduced || !desktop) return
    if (!lenisInstance) {
      try {
        lenisInstance = new Lenis({ autoRaf: true })
      } catch {
        return
      }
      sync()
      listeners.forEach((l) => l())
    }
    lenisUsers++
    return () => {
      if (--lenisUsers === 0 && lenisInstance) {
        lenisInstance.destroy()
        lenisInstance = null
        listeners.forEach((l) => l())
      }
    }
  }, [reduced, desktop])

  return reduced || !desktop ? null : lenis
}
