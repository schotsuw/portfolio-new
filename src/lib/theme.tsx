import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'theme'

/** Inlined verbatim in index.html (a test asserts it) to avoid a theme flash. */
export const THEME_SCRIPT =
  "(function(){var d=false;try{var t=localStorage.getItem('theme');d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){try{d=matchMedia('(prefers-color-scheme: dark)').matches}catch(e2){}}if(d)document.documentElement.classList.add('dark')})();"

function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* storage unavailable (e.g. Safari private mode) */
  }
  return null
}

function initialTheme(): Theme {
  return storedTheme() ?? systemTheme()
}

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  // Once the user has chosen (or a choice was stored), system changes are ignored.
  const chosen = useRef<boolean | null>(null)
  if (chosen.current === null) chosen.current = storedTheme() !== null

  useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    const onChange = (e: { matches: boolean }) => {
      if (!chosen.current) setThemeState(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    chosen.current = true
    setThemeState(t)
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* ignore */
    }
  }, [])
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTheme must be used within ThemeProvider')
  return c
}
