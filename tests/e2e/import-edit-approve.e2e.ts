import { expect, test } from '@playwright/test'
import { blockRows, editor, openDocument, sentenceRows } from './support/open-document.js'

test.describe('importing, editing and approving', () => {
  test('imports a .docx and shows every paragraph with its sentences', async ({ page }) => {
    await openDocument(page)
    await expect(blockRows(page)).toHaveCount(3)
    await expect(sentenceRows(page)).toHaveCount(4)
  })

  test('does not split a sentence on an abbreviation', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page).nth(1).locator('.source')).toHaveText(
      'Dr. Ellison had waited thirty years.',
    )
  })

  test('keeps an edited translation across a reload', async ({ page }) => {
    await openDocument(page)
    const field = sentenceRows(page).first().locator('textarea')
    await field.fill('Молчаливый наблюдатель')
    await field.blur()
    await expect(editor(page).locator('.counts')).toContainText('1 translated')

    await page.reload()
    await editor(page).waitFor()
    await expect(sentenceRows(page).first().locator('textarea')).toHaveValue('Молчаливый наблюдатель')
  })

  test('editing clears an approval, because the approved text has changed', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await row.locator('textarea').fill('Первый вариант')
    await row.locator('textarea').blur()
    await row.getByRole('checkbox').check()
    await expect(row.getByRole('checkbox')).toBeChecked()

    await row.locator('textarea').fill('Второй вариант')
    await row.locator('textarea').blur()
    await expect(row.getByRole('checkbox')).not.toBeChecked()
  })

  test('a translation with no text cannot be approved', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page).first().getByRole('checkbox')).toBeDisabled()
  })

  test('approving every sentence of a paragraph reports the paragraph as approved', async ({ page }) => {
    await openDocument(page)
    const paragraph = blockRows(page).nth(1)
    const sentences = sentenceRows(page).nth(1)
    for (const index of [1, 2]) {
      const row = sentenceRows(page).nth(index)
      await row.locator('textarea').fill(`перевод ${String(index)}`)
      await row.locator('textarea').blur()
      await row.getByRole('checkbox').check()
    }
    await expect(sentences.getByRole('checkbox')).toBeChecked()
    await expect(paragraph.getByRole('checkbox')).toBeChecked()
  })

  test('approving a paragraph cascades to its sentences and un-approving reverses it', async ({ page }) => {
    await openDocument(page)
    for (const index of [1, 2]) {
      const row = sentenceRows(page).nth(index)
      await row.locator('textarea').fill(`перевод ${String(index)}`)
      await row.locator('textarea').blur()
    }
    const paragraph = blockRows(page).nth(1)
    await paragraph.getByRole('checkbox').check()
    await expect(sentenceRows(page).nth(1).getByRole('checkbox')).toBeChecked()
    await expect(sentenceRows(page).nth(2).getByRole('checkbox')).toBeChecked()

    await paragraph.getByRole('checkbox').uncheck()
    await expect(sentenceRows(page).nth(1).getByRole('checkbox')).not.toBeChecked()
    await expect(sentenceRows(page).nth(2).getByRole('checkbox')).not.toBeChecked()
  })
})
