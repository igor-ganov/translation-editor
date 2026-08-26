import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import type { Page } from 'playwright'
import { makeFixtureDocx } from '../tests/e2e/fixtures/make-fixture-docx.js'

/**
 * Photographs every screen at the width of a phone.
 *
 * Written after a set of mockups shipped that nobody had looked at, and reached
 * a real device black on black. A build that has not been seen has not been checked.
 */
const PORT = Number(process.env['PORT'] ?? 4325)
const OUT = 'design/screens'

const shoot = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  process.stdout.write(`${OUT}/${name}.png\n`)
}

const app = (page: Page) => page.locator('te-app')

const run = async (): Promise<void> => {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 })
  await page.goto(`http://localhost:${String(PORT)}/`)

  await app(page).locator('te-projects').getByRole('button', { name: 'Open a document' }).waitFor()
  await shoot(page, '1-shelf-empty')

  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    app(page).locator('te-projects').getByRole('button', { name: 'Open a document' }).click(),
  ])
  await chooser.setFiles(await makeFixtureDocx())

  await app(page).locator('te-editor').locator('te-sentence-pair').first().waitFor()
  await shoot(page, '2-page')

  await app(page).locator('te-editor').getByRole('button', { name: 'Desk' }).click()
  await app(page).locator('te-desk').waitFor()
  await shoot(page, '3-desk')

  await app(page).locator('te-desk').getByRole('button', { name: 'Back to the page' }).click()
  await app(page).locator('te-editor').getByRole('button', { name: /^page/ }).click()
  await app(page).locator('te-contents').waitFor()
  await shoot(page, '4-contents')

  await browser.close()
}

await run()
