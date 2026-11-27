import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { site } from '../../content'
import GlassButton from '../glass/GlassButton'

const COPIED_MS = 2000
const ANNOUNCE_DELAY_MS = 100

/** Copies the email address; falls back to a mailto: link when the clipboard is unavailable or rejected. */
export default function CopyEmail() {
  const [copied, setCopied] = useState(false)
  // Live-region text lags `copied`: cleared first, then set, so repeat clicks re-announce.
  const [announce, setAnnounce] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const announceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(announceTimer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(site.email)
    } catch {
      window.location.href = `mailto:${site.email}`
      return
    }
    setCopied(true)
    setAnnounce('')
    clearTimeout(announceTimer.current)
    announceTimer.current = setTimeout(() => setAnnounce(`${site.email} copied to clipboard`), ANNOUNCE_DELAY_MS)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopied(false)
      setAnnounce('')
    }, COPIED_MS)
  }

  return (
    <>
      <GlassButton
        onClick={copy}
        icon={copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      >
        {copied ? 'Copied' : 'Copy email'}
      </GlassButton>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </>
  )
}
