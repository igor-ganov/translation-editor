import { expect, test } from '@playwright/test'
import { editor, openDocument, sentenceRows } from './support/open-document.js'

test.describe('accessibility', () => {
  test('presents the document as a list of segment pairs', async ({ page }) => {
    await openDocument(page)
    await expect(editor(page).locator('[role="list"]')).toHaveCount(1)
    await expect(sentenceRows(page).first().locator('[role="listitem"]')).toHaveCount(1)
  })

  test('labels the editing field with the sentence it translates', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page).nth(1).locator('textarea')).toHaveAttribute(
      'aria-label',
      'Translation of: Dr. Ellison had waited thirty years.',
    )
  })

  test('states every segment status in words, not only by colour', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await expect(row.locator('.status')).toContainText('Not translated')

    await row.locator('textarea').fill('Молчаливый наблюдатель')
    await row.locator('textarea').blur()
    await expect(row.locator('.status')).toContainText('Edited')
  })

  test('describes the field by its status, so the state is announced with it', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const describedBy = await row.locator('textarea').getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(row.locator(`#${String(describedBy)}`)).toHaveCount(1)
  })

  test('reports approval progress as a progressbar with a value', async ({ page }) => {
    await openDocument(page)
    const bar = editor(page).locator('[role="progressbar"]')
    await expect(bar).toHaveAttribute('aria-valuenow', '0')
    await expect(bar).toHaveAttribute('aria-label', 'Approved segments')
  })

  test('approves and leaves the field from the keyboard alone', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const field = row.locator('textarea')

    await field.focus()
    await field.fill('Молчаливый наблюдатель')
    await page.keyboard.press('Control+Enter')
    await expect(row.getByRole('checkbox')).toBeChecked()
    await expect(field).not.toBeFocused()
  })

  test('leaves the field on Escape without losing what was typed', async ({ page }) => {
    await openDocument(page)
    const field = sentenceRows(page).first().locator('textarea')
    await field.focus()
    await field.fill('черновик')
    await page.keyboard.press('Escape')
    await expect(field).not.toBeFocused()
    await expect(field).toHaveValue('черновик')
  })

  test('marks the collapse control with its expanded state', async ({ page }) => {
    await openDocument(page)
    const toggle = editor(page).locator('te-block-row').first().getByRole('button', { name: /sentences/ })
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
