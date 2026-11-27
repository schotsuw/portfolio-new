import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { revealAll, THEMES, useTheme, waitForReveals } from './helpers'

async function seriousViolations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.impact} ${v.id}: ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** Waits for the overlay's entrance (slide or fade) to finish so axe sees final colours. */
async function waitForDialog(page: Page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.waitForFunction(() => {
    const d = document.querySelector<HTMLElement>('[role="dialog"]')
    if (!d) return false
    const s = getComputedStyle(d)
    return s.opacity === '1' && (s.transform === 'none' || s.transform === 'matrix(1, 0, 0, 1, 0, 0)')
  })
}

for (const theme of THEMES) {
  test(`axe: / in ${theme} has no serious or critical violations`, async ({ page }) => {
    await useTheme(page, theme)
    await page.goto('/')
    await revealAll(page)
    expect(await seriousViolations(page)).toEqual([])
  })

  test(`axe: /projects/ask-introhive in ${theme} has no serious or critical violations`, async ({ page }) => {
    await useTheme(page, theme)
    await page.goto('/projects/ask-introhive')
    await waitForDialog(page)
    expect(await seriousViolations(page)).toEqual([])
  })
}

test.describe('desktop motion', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Lenis is active on desktop with motion allowed (control for the reduced-motion check)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\blenis\b/)
  })

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('html lacks the lenis class and cards render in their final state', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('main')).toBeVisible()
      // Give any (wrongly) mounted Lenis time to add its class.
      await page.waitForTimeout(300)
      await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
      // No reveal animation: every card is already at full opacity with no transform, unscrolled.
      expect(await page.locator('[data-reveal]').count()).toBeGreaterThan(0)
      await waitForReveals(page)
      const animated = await page.evaluate(
        () => Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter((el) => el.style.opacity || el.style.transform).length,
      )
      expect(animated).toBe(0)
    })
  })
})
