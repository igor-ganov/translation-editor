import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { editor, openDocument, sentenceRows } from './support/open-document.js'

const focusedSource = async (page: Page) =>
  await page.evaluate(() => {
    const app = document.querySelector('te-app')
    const list = app?.shadowRoot?.querySelector('te-editor')?.shadowRoot?.querySelector('.list')
    const first = list?.querySelector('te-sentence-pair')
    return first?.shadowRoot?.querySelector('.source')?.textContent ?? ''
  })

test.describe('moving around the document', () => {
  test('jumps to the next unapproved segment and keeps going', async ({ page }) => {
    await openDocument(page)
    const first = sentenceRows(page).first()
    await first.locator('textarea').fill('translated')
    await first.locator('textarea').blur()
    await first.getByRole('checkbox').check()

    await editor(page).getByRole('button', { name: 'Next unapproved' }).click()
    await expect(editor(page).locator('.notice')).toHaveCount(0)
  })

  test('says so when there is nothing left to approve in the view', async ({ page }) => {
    await openDocument(page)
    await editor(page).locator('select').selectOption('failed')
    await editor(page).getByRole('button', { name: 'Next unapproved' }).click()
    await expect(page.locator('te-app').locator('.notice')).toContainText('Nothing left to approve')
  })

  test('filters the view down to untranslated segments', async ({ page }) => {
    await openDocument(page)
    const first = sentenceRows(page).first()
    await first.locator('textarea').fill('translated')
    await first.locator('textarea').blur()

    await editor(page).locator('select').selectOption('untranslated')
    await expect(sentenceRows(page)).toHaveCount(3)
    expect(await focusedSource(page)).not.toBe('The Silent Observer')
  })

  test('collapses a paragraph to its header and expands it again', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page)).toHaveCount(4)

    const toggle = editor(page).locator('te-block-row').first().getByRole('button', { name: /sentences/ })
    await toggle.click()
    await expect(sentenceRows(page)).toHaveCount(3)
    await toggle.click()
    await expect(sentenceRows(page)).toHaveCount(4)
  })

  test('undoes a sentence merge as one step', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page)).toHaveCount(4)

    await sentenceRows(page).nth(1).getByRole('button', { name: 'Merge next' }).click()
    await expect(sentenceRows(page)).toHaveCount(3)

    await editor(page).getByRole('button', { name: /^Undo/ }).click()
    await expect(sentenceRows(page)).toHaveCount(4)
  })
})
