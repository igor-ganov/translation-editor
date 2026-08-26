import type { Locator, Page } from '@playwright/test'
import { makeFixtureDocx } from '../fixtures/make-fixture-docx.js'

export const app = (page: Page) => page.locator('te-app')
export const projects = (page: Page) => app(page).locator('te-projects')
export const editor = (page: Page) => app(page).locator('te-editor')
export const desk = (page: Page) => app(page).locator('te-desk')
export const contents = (page: Page) => app(page).locator('te-contents')
export const blockRows = (page: Page) => editor(page).locator('te-block-row')
export const sentenceRows = (page: Page) => editor(page).locator('te-sentence-pair')

export const field = (row: Locator) => row.locator('textarea')
export const settle = (row: Locator) => row.getByRole('button', { name: /^(settle|unsettle)$/ })
export const mark = (row: Locator) => row.locator('.mark')

/** The translation as it is read: text on the page, not a control. */
export const reading = (row: Locator) => row.locator('p.leaf__target')

/** Editing is entered deliberately, so a test that writes has to open the editor. */
export const openEditor = async (row: Locator): Promise<Locator> => {
  await row.getByRole('button', { name: /^(edit|write one for the whole paragraph)$/ }).click()
  await field(row).waitFor()
  return field(row)
}

export const writeIn = async (row: Locator, text: string): Promise<void> => {
  const box = await openEditor(row)
  await box.fill(text)
  await box.blur()
}

/** The page turner, which is the only navigation on the reading screen. */
export const turner = (page: Page) => editor(page).locator('.turner')
export const nextPage = (page: Page) => turner(page).getByRole('button', { name: 'Next page' })
export const previousPage = (page: Page) => turner(page).getByRole('button', { name: 'Previous page' })

/** Every command that acts on the document now lives one tap away, on the desk. */
export const openDesk = async (page: Page): Promise<void> => {
  await editor(page).getByRole('button', { name: 'Desk' }).click()
  await desk(page).waitFor()
}

export const leaveDesk = async (page: Page): Promise<void> => {
  await desk(page).getByRole('button', { name: 'Back to the page' }).click()
  await editor(page).waitFor()
}

export const openContents = async (page: Page): Promise<void> => {
  await editor(page).getByRole('button', { name: /^page \d+ of \d+$/ }).click()
  await contents(page).waitFor()
}

/** Filters are on the desk; choosing one returns to the page it applies to. */
export const chooseFilter = async (page: Page, name: string): Promise<void> => {
  await openDesk(page)
  await desk(page).getByRole('button', { name, exact: true }).click()
  await leaveDesk(page)
}

export const runFromDesk = async (page: Page, name: string | RegExp): Promise<void> => {
  await openDesk(page)
  await desk(page).getByRole('button', { name }).click()
}

/**
 * Imports a document through the real file picker. The input is created on demand
 * by the adapter, so the chooser event is awaited rather than the input.
 */
export const openFile = async (page: Page, path: string): Promise<void> => {
  await page.goto('/')
  const open = projects(page).getByRole('button', { name: 'Open a document' })
  await open.waitFor()
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), open.click()])
  await chooser.setFiles(path)
  await editor(page).waitFor()
  await sentenceRows(page).first().waitFor()
}

export const openDocument = async (page: Page): Promise<void> => openFile(page, await makeFixtureDocx())
