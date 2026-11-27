import {
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { getProject } from '../content'

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'project'; slug: string }

const HOME: Route = { name: 'home' }

export function parsePath(path: string): Route {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (clean === '/') return HOME
  if (clean === '/about') return { name: 'about' }
  const m = /^\/projects\/([^/]+)$/.exec(clean)
  if (m) {
    let slug = m[1]
    try {
      slug = decodeURIComponent(slug)
    } catch {
      return HOME
    }
    return getProject(slug) ? { name: 'project', slug } : HOME
  }
  return HOME
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function subscribe(cb: () => void) {
  if (listeners.size === 0) window.addEventListener('popstate', notify)
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
    if (listeners.size === 0) window.removeEventListener('popstate', notify)
  }
}

const getSnapshot = () => location.pathname
const getServerSnapshot = () => '/'

/** True when `to` points at a path that the router renders as a known route or the root. */
function isKnownPath(to: string): boolean {
  const clean = to.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return clean === '/' || parsePath(to).name !== 'home'
}

/**
 * Unknown paths/slugs render home, so navigating to one resolves to `/` (replace) to keep the
 * URL in step with the view and avoid a junk history entry.
 */
export function navigate(to: string, opts: { replace?: boolean } = {}): void {
  if (!isKnownPath(to)) {
    to = '/'
    opts = { ...opts, replace: true }
  }
  const fromHome = parsePath(location.pathname).name === 'home'
  const target = parsePath(to).name !== 'home'
  if (opts.replace) {
    history.replaceState(target ? history.state : null, '', to)
  } else {
    history.pushState(fromHome && target ? { fromHome: true } : null, '', to)
  }
  notify()
}

export function closeOverlay(): void {
  if (history.state?.fromHome) history.back()
  else navigate('/', { replace: true })
}

export function RouterProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function useRoute(): Route {
  const path = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => parsePath(path), [path])
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  /** Replace the current history entry instead of pushing (e.g. Prev/Next inside an overlay). */
  replace?: boolean
}

function isInternal(href: string, rel?: string, download?: unknown): boolean {
  if (download !== undefined && download !== false) return false
  if (rel && /\bexternal\b/i.test(rel)) return false
  if (href.startsWith('#')) return false // same-page anchor: let the browser handle it
  try {
    const url = new URL(href, location.href)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === location.origin
  } catch {
    return false
  }
}

export function Link({ href, onClick, target, replace, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (target && target !== '_self') ||
      !isInternal(href, rest.rel, rest.download)
    )
      return
    e.preventDefault()
    const url = new URL(href, location.href)
    navigate(url.pathname + url.search + url.hash, { replace })
  }
  return <a href={href} target={target} onClick={handle} {...rest} />
}
