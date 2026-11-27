import type { Page } from '@playwright/test'

export type Theme = 'light' | 'dark'
export const THEMES: Theme[] = ['light', 'dark']
export const SLUGS = ['ask-introhive', 'introhive-mcp', 'plant-as-battery', 'slang-or-not'] as const

/** Stores the theme before any page script runs, so the head script applies it with no flash. */
export async function useTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t)
    } catch {
      /* ignore */
    }
  }, theme)
}

/** Waits until every visible in-view card has finished its reveal (opacity 1, no transform). */
export async function waitForReveals(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      .filter((el) => el.getClientRects().length > 0)
      .every((el) => {
        const s = getComputedStyle(el)
        return s.opacity === '1' && (s.transform === 'none' || s.transform === 'matrix(1, 0, 0, 1, 0, 0)')
      }),
  )
}

/**
 * In-view reveals fire once, as cards scroll into view. Full-page screenshots and measurements need
 * every card in its final state, so step through the page first, then return to the top.
 */
export async function revealAll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const step = Math.max(200, Math.floor(innerHeight * 0.6))
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await frame()
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    await frame()
  })
  await waitForReveals(page)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  // Let finite CSS/WAAPI animations (e.g. the monogram draw-in) reach their final frame.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
      .every((a) => a.playState === 'finished'),
  )
}
