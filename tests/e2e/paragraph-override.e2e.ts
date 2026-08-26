import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  blockRows,
  desk,
  openDesk,
  openDocument,
  reading,
  sentenceRows,
  approve,
  writeIn,
} from './support/open-document.js'

const restore = (page: Page) =>
  blockRows(page).nth(1).getByRole('button', { name: 'Go back to the sentences' })

/** The rule the whole application turns on: a paragraph translation wins. */
test.describe('paragraph translation overriding its sentences', () => {
  const draftSentences = async (page: Page) => {
    for (const index of [1, 2]) await writeIn(sentenceRows(page).nth(index), `sentence ${String(index)}`)
  }

  const override = async (page: Page) =>
    writeIn(blockRows(page).nth(1), 'One restructured paragraph.')

  test('a paragraph translation marks the paragraph as overriding', async ({ page }) => {
    await openDocument(page)
    await expect(blockRows(page).nth(1).locator('.whole--ruling')).toHaveCount(0)
    await expect(restore(page)).toHaveCount(0)

    await override(page)
    await expect(blockRows(page).nth(1).locator('.whole--ruling')).toHaveCount(1)
    await expect(restore(page)).toBeVisible()
  })

  test('overridden sentences stay readable and keep their text, rather than being hidden', async ({ page }) => {
    await openDocument(page)
    await draftSentences(page)
    await override(page)

    const row = sentenceRows(page).nth(1)
    // Kept and legible, but no longer offered for editing: it is not what the
    // document will export while the paragraph stands in for it.
    await expect(reading(row)).toHaveText('sentence 1')
    await expect(row.getByRole('button', { name: 'edit' })).toHaveCount(0)
  })

  test('removing the paragraph translation brings the sentences back', async ({ page }) => {
    await openDocument(page)
    await draftSentences(page)
    await override(page)
    await expect(restore(page)).toBeVisible()

    await restore(page).click()
    await expect(blockRows(page).nth(1).locator('.whole--ruling')).toHaveCount(0)
    const row = sentenceRows(page).nth(1)
    await expect(reading(row)).toHaveText('sentence 1')
    await expect(row.getByRole('button', { name: 'edit' })).toBeVisible()
  })

  test('an overridden paragraph counts as one unit of progress', async ({ page }) => {
    await openDocument(page)
    await openDesk(page)
    await expect(desk(page).locator('.thread__count')).toContainText('0 of 4 approved')
    await desk(page).getByRole('button', { name: 'Back to the page' }).click()

    await override(page)
    await openDesk(page)
    await expect(desk(page).locator('.thread__count')).toContainText('0 of 3 approved')
  })

  test('approving an overridden paragraph does not touch its sentences', async ({ page }) => {
    await openDocument(page)
    await draftSentences(page)
    await override(page)

    const paragraph = blockRows(page).nth(1)
    await approve(paragraph).click()
    await expect(approve(paragraph)).toHaveAttribute('aria-pressed', 'true')
    await expect(approve(sentenceRows(page).nth(1))).toHaveAttribute('aria-pressed', 'false')
  })
})
