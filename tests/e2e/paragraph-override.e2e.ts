import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { blockRows, editor, openDocument, sentenceRows } from './support/open-document.js'

/** The rule the whole application turns on: a paragraph translation wins. */
test.describe('paragraph translation overriding its sentences', () => {
  const fillSentences = async (page: Page) => {
    for (const index of [1, 2]) {
      const row = sentenceRows(page).nth(index)
      await row.locator('textarea').fill(`sentence ${String(index)}`)
      await row.locator('textarea').blur()
    }
  }

  test('a paragraph translation marks the paragraph as overriding', async ({ page }) => {
    await openDocument(page)
    const paragraph = blockRows(page).nth(1)
    await expect(paragraph.locator('.overriding')).toHaveCount(0)

    await paragraph.locator('textarea').fill('One restructured paragraph.')
    await paragraph.locator('textarea').blur()
    await expect(paragraph.locator('.overriding')).toHaveText('Overriding its sentences')
  })

  test('overridden sentences become inert but keep their text', async ({ page }) => {
    await openDocument(page)
    await fillSentences(page)
    await blockRows(page).nth(1).locator('textarea').fill('One restructured paragraph.')
    await blockRows(page).nth(1).locator('textarea').blur()

    await expect(sentenceRows(page).nth(1).locator('textarea')).toBeDisabled()
    await expect(sentenceRows(page).nth(1).locator('textarea')).toHaveValue('sentence 1')
  })

  test('removing the paragraph translation brings the sentences back', async ({ page }) => {
    await openDocument(page)
    await fillSentences(page)
    const paragraph = blockRows(page).nth(1)
    await paragraph.locator('textarea').fill('One restructured paragraph.')
    await paragraph.locator('textarea').blur()
    await expect(paragraph.locator('.overriding')).toBeVisible()

    await paragraph.getByRole('button', { name: 'Use sentences' }).click()
    await expect(paragraph.locator('.overriding')).toHaveCount(0)
    await expect(sentenceRows(page).nth(1).locator('textarea')).toBeEnabled()
    await expect(sentenceRows(page).nth(1).locator('textarea')).toHaveValue('sentence 1')
  })

  test('an overridden paragraph counts as one unit of progress', async ({ page }) => {
    await openDocument(page)
    await expect(editor(page).locator('.counts')).toContainText('0 of 4 approved')

    const paragraph = blockRows(page).nth(1)
    await paragraph.locator('textarea').fill('One restructured paragraph.')
    await paragraph.locator('textarea').blur()
    await expect(editor(page).locator('.counts')).toContainText('0 of 3 approved')
  })

  test('approving an overridden paragraph does not touch its sentences', async ({ page }) => {
    await openDocument(page)
    await fillSentences(page)
    const paragraph = blockRows(page).nth(1)
    await paragraph.locator('textarea').fill('One restructured paragraph.')
    await paragraph.locator('textarea').blur()
    await paragraph.getByRole('checkbox').check()

    await expect(paragraph.getByRole('checkbox')).toBeChecked()
    await expect(sentenceRows(page).nth(1).getByRole('checkbox')).not.toBeChecked()
  })
})
