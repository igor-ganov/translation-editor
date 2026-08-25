import type { Page } from '@playwright/test'
import { makeFixtureDocx } from '../fixtures/make-fixture-docx.js'

export const app = (page: Page) => page.locator('te-app')
export const projects = (page: Page) => app(page).locator('te-projects')
export const editor = (page: Page) => app(page).locator('te-editor')
export const blockRows = (page: Page) => editor(page).locator('te-block-row')
export const sentenceRows = (page: Page) => editor(page).locator('te-sentence-pair')

/**
 * Imports the fixture document through the real file picker. The input is created
 * on demand by the adapter, so the chooser event is awaited rather than the input.
 */
export const openDocument = async (page: Page): Promise<void> => {
  await page.goto('/')
  await projects(page).getByRole('button', { name: 'Import .docx' }).waitFor()
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    projects(page).getByRole('button', { name: 'Import .docx' }).click(),
  ])
  await chooser.setFiles(await makeFixtureDocx())
  await editor(page).waitFor()
  await sentenceRows(page).first().waitFor()
}
