import { expect, test, type Page } from '@playwright/test'
import { SLUGS } from './helpers'

const TITLES: Record<(typeof SLUGS)[number], string> = {
  'ask-introhive': 'Ask Introhive',
  'introhive-mcp': 'Introhive MCP',
  'plant-as-battery': 'Plant as Battery',
  'slang-or-not': 'Slang-or-Not',
}

const HOME = 'http://localhost:4173/'

function collectErrors(page: Page): Error[] {
  const errors: Error[] = []
  page.on('pageerror', (e) => errors.push(e))
  return errors
}

for (const slug of SLUGS) {
  test(`direct load /projects/${slug} shows the dialog; Close lands on / and stays on the site`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(`/projects/${slug}`)
    const dialog = page.getByRole('dialog', { name: TITLES[slug] })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { level: 1, name: TITLES[slug] })).toBeVisible()

    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(page).toHaveURL(HOME)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('main')).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('direct load then Esc lands on / and stays on the site', async ({ page }) => {
  await page.goto('/projects/introhive-mcp')
  await expect(page.getByRole('dialog', { name: 'Introhive MCP' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(HOME)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('direct load /about shows the About dialog; Close lands on /', async ({ page }) => {
  await page.goto('/about')
  const dialog = page.getByRole('dialog', { name: 'About' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL(HOME)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

for (const path of ['/projects/nope', '/foo']) {
  test(`${path} renders home with no dialog`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(path)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL(new URL(path, HOME).href)
    expect(errors).toEqual([])
  })
}

test('opening from the grid, then Back closes and Forward reopens', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Ask Introhive', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Ask Introhive' })
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(`${HOME}projects/ask-introhive`)

  await page.goBack()
  await expect(page).toHaveURL(HOME)
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.goForward()
  await expect(page).toHaveURL(`${HOME}projects/ask-introhive`)
  await expect(page.getByRole('dialog', { name: 'Ask Introhive' })).toBeVisible()
})

test('/projects/ask-introhive serves HTML whose og:title names the project', async ({ request }) => {
  const res = await request.get('/projects/ask-introhive')
  expect(res.ok()).toBe(true)
  expect(res.headers()['content-type']).toContain('text/html')
  const html = await res.text()
  const og = /<meta\s+property="og:title"\s+content="([^"]*)"/.exec(html)
  expect(og?.[1]).toContain('Ask Introhive')
})
