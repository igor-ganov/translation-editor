import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  blockRows,
  desk,
  field,
  openDesk,
  openDocument,
  sentenceRows,
  settle,
} from './support/open-document.js'

const restore = (page: Page) =>
  blockRows(page).nth(1).getByRole('button', { name: 'Go back to the sentences' })

/** The rule the whole application turns on: a paragraph translation wins. */
test.describe('paragraph translation overriding its sentences', () => {
  const draftSentences = async (page: Page) => {
    for (const index of [1, 2]) {
      const row = sentenceRows(page).nth(index)
      await field(row).fill(`sentence ${String(index)}`)
      await field(row).blur()
    }
  }

  const override = async (page: Page) => {
    const paragraph = blockRows(page).nth(1)
    await field(paragraph).fill('One restructured paragraph.')
    await field(paragraph).blur()
  }

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
    await expect(field(row)).toHaveAttribute('readonly', '')
    await expect(field(row)).toHaveValue('sentence 1')
  })

  test('removing the paragraph translation brings the sentences back', async ({ page }) => {
    await openDocument(page)
    await draftSentences(page)
    await override(page)
    await expect(restore(page)).toBeVisible()

    await restore(page).click()
    await expect(blockRows(page).nth(1).locator('.whole--ruling')).toHaveCount(0)
    const row = sentenceRows(page).nth(1)
    await expect(field(row)).not.toHaveAttribute('readonly', '')
    await expect(field(row)).toHaveValue('sentence 1')
  })

  test('an overridden paragraph counts as one unit of progress', async ({ page }) => {
    await openDocument(page)
    await openDesk(page)
    await expect(desk(page).locator('.thread__count')).toContainText('0 of 4 settled')
    await desk(page).getByRole('button', { name: 'Back to the page' }).click()

    await override(page)
    await openDesk(page)
    await expect(desk(page).locator('.thread__count')).toContainText('0 of 3 settled')
  })

  test('settling an overridden paragraph does not touch its sentences', async ({ page }) => {
    await openDocument(page)
    await draftSentences(page)
    await override(page)

    const paragraph = blockRows(page).nth(1)
    await settle(paragraph).click()
    await expect(settle(paragraph)).toHaveAttribute('aria-pressed', 'true')
    await expect(settle(sentenceRows(page).nth(1))).toHaveAttribute('aria-pressed', 'false')
  })
})
