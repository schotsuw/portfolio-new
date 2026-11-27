import { expect, test } from '@playwright/test'
import { revealAll, THEMES, useTheme } from './helpers'

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1152, height: 800 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
]

const BALANCED_FROM = 1280 // column bottoms are checked at 1280 and 1440
const BALANCE_PX = 24

for (const theme of THEMES) {
  for (const vp of VIEWPORTS) {
    test(`${vp.width}x${vp.height} ${theme}: no overflow, no clipped card text`, async ({ page }, info) => {
      await page.setViewportSize(vp)
      await useTheme(page, theme)
      await page.goto('/')
      const html = expect(page.locator('html'))
      await (theme === 'dark' ? html.toHaveClass(/\bdark\b/) : html.not.toHaveClass(/\bdark\b/))
      await revealAll(page)

      // Review Focus 5: no horizontal overflow at any width.
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth)

      // No card clips its text. Vertically, the card and its text container must hold their
      // content. Horizontally, so must every text block (e.g. a nowrap time or a long word).
      // Individual text blocks are not checked vertically: tight display line-heights let glyphs
      // overhang their own line box by a pixel or two, which is not clipping.
      const clipped = await page.evaluate(() => {
        const label = (el: Element) => {
          const card = el.closest('[data-card]')
          const name = card?.getAttribute('data-card') ?? '?'
          const text = (el.textContent ?? '').trim().slice(0, 40)
          return `${name} <${el.tagName.toLowerCase()}> "${text}"`
        }
        const out: string[] = []
        for (const card of document.querySelectorAll<HTMLElement>('[data-card]')) {
          if (card.getClientRects().length === 0) continue // hidden at this breakpoint
          const containers = [card, ...card.querySelectorAll<HTMLElement>('[data-card-text]')]
          const blocks = card.querySelectorAll<HTMLElement>('h1, h2, h3, p, dt, dd, li')
          const report = (el: HTMLElement) =>
            out.push(`${label(el)} scroll ${el.scrollWidth}x${el.scrollHeight} > client ${el.clientWidth}x${el.clientHeight}`)
          for (const el of containers) {
            if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) report(el)
          }
          for (const el of blocks) {
            if (el.scrollWidth > el.clientWidth + 1) report(el)
          }
        }
        return out
      })
      expect(clipped).toEqual([])

      if (vp.width >= BALANCED_FROM) {
        const bottoms = await page.evaluate(() =>
          ['grid-col-1', 'grid-col-2', 'grid-col-3'].map((id) => {
            const last = document.querySelector(`[data-testid="${id}"]`)?.lastElementChild
            return last ? last.getBoundingClientRect().bottom + window.scrollY : NaN
          }),
        )
        expect(bottoms.every(Number.isFinite)).toBe(true)
        expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(BALANCE_PX)
      }

      await page.screenshot({
        path: `test-results/layout-${info.project.name}-${vp.width}x${vp.height}-${theme}.png`,
        fullPage: true,
      })
    })
  }
}
