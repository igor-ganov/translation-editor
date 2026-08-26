import { expect, test } from '@playwright/test'
import {
  blockRows,
  desk,
  editor,
  field,
  mark,
  openDesk,
  openDocument,
  sentenceRows,
  settle,
} from './support/open-document.js'

test.describe('accessibility', () => {
  test('presents the page as a list of segment pairs', async ({ page }) => {
    await openDocument(page)
    await expect(editor(page).locator('[role="list"]')).toHaveCount(1)
    await expect(sentenceRows(page).first().locator('[role="listitem"]')).toHaveCount(1)
  })

  test('labels the editing field with the sentence it translates', async ({ page }) => {
    await openDocument(page)
    await expect(field(sentenceRows(page).nth(1))).toHaveAttribute(
      'aria-label',
      'Translation of: Dr. Ellison had waited thirty years.',
    )
  })

  test('states every segment status in words, not only by colour', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await expect(mark(row)).toHaveText('untouched')

    await field(row).fill('a first attempt')
    await field(row).blur()
    await expect(mark(row)).toHaveText('your wording')
  })

  test('describes the field by its status, so the state is announced with it', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const describedBy = await field(row).getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(row.locator(`#${String(describedBy)}`)).toHaveCount(1)
  })

  test('reports settled progress as a progressbar with a value', async ({ page }) => {
    await openDocument(page)
    await openDesk(page)
    const bar = desk(page).locator('[role="progressbar"]')
    await expect(bar).toHaveAttribute('aria-valuenow', '0')
    await expect(bar).toHaveAttribute('aria-label', 'Settled segments')
  })

  test('settles and leaves the field from the keyboard alone', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()

    await field(row).focus()
    await field(row).fill('a translation')
    await page.keyboard.press('Control+Enter')
    await expect(settle(row)).toHaveAttribute('aria-pressed', 'true')
    await expect(field(row)).not.toBeFocused()
  })

  test('leaves the field on Escape without losing what was typed', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await field(row).focus()
    await field(row).fill('a draft')
    await page.keyboard.press('Escape')
    await expect(field(row)).not.toBeFocused()
    await expect(field(row)).toHaveValue('a draft')
  })

  test('marks the fold control with its expanded state', async ({ page }) => {
    await openDocument(page)
    const toggle = blockRows(page).first().getByRole('button', { name: /sentences/ })
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('marks the chosen filter as pressed, so it is not carried by weight alone', async ({ page }) => {
    await openDocument(page)
    await openDesk(page)
    await expect(desk(page).getByRole('button', { name: 'Everything' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
