import { expect, test } from '@playwright/test'
import {
  blockRows,
  desk,
  editor,
  field,
  mark,
  openDesk,
  openDocument,
  openEditor,
  sentenceRows,
  approve,
  writeIn,
} from './support/open-document.js'

test.describe('accessibility', () => {
  test('presents the page as a list of segment pairs', async ({ page }) => {
    await openDocument(page)
    await expect(editor(page).locator('[role="list"]')).toHaveCount(1)
    await expect(sentenceRows(page).first().locator('[role="listitem"]')).toHaveCount(1)
  })

  test('labels the editing field with the sentence it translates', async ({ page }) => {
    await openDocument(page)
    const box = await openEditor(sentenceRows(page).nth(1))
    await expect(box).toHaveAttribute('aria-label', 'Translation of: Dr. Ellison had waited thirty years.')
  })

  test('states every segment status in words, not only by colour', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await expect(mark(row)).toHaveText('not translated')

    await writeIn(row, 'a first attempt')
    await expect(mark(row)).toHaveText('edited by you')
  })

  test('describes the field by its status, so the state is announced with it', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const box = await openEditor(row)
    const describedBy = await box.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(row.locator(`#${String(describedBy)}`)).toHaveCount(1)
  })

  test('reports approved progress as a progressbar with a value', async ({ page }) => {
    await openDocument(page)
    await openDesk(page)
    const bar = desk(page).locator('[role="progressbar"]')
    await expect(bar).toHaveAttribute('aria-valuenow', '0')
    await expect(bar).toHaveAttribute('aria-label', 'Approved segments')
  })

  test('approves and leaves the field from the keyboard alone', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const box = await openEditor(row)

    await box.fill('a translation')
    await page.keyboard.press('Control+Enter')
    await expect(approve(row)).toHaveAttribute('aria-pressed', 'true')
    await expect(field(row)).toHaveCount(0)
  })

  test('leaves the field on Escape without losing what was typed', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    const box = await openEditor(row)
    await box.fill('a draft')
    await page.keyboard.press('Escape')
    await expect(field(row)).toHaveCount(0)
    await expect(row.locator('p.leaf__target')).toHaveText('a draft')
  })

  test('keeps what a sentence is apart from what can be done to it', async ({ page }) => {
    // Both shared one line at one weight, so a reader could not tell the fact
    // from the things they could press.
    await openDocument(page)
    const row = sentenceRows(page).first()
    await expect(row.locator('.leaf__state .act')).toHaveCount(0)
    await expect(row.locator('.leaf__commands .mark')).toHaveCount(0)
    await expect(row.locator('.leaf__commands button')).toHaveCount(3)
  })

  test('gives every command a drawn hint and a word, never a glyph on its own', async ({ page }) => {
    await openDocument(page)
    const commands = sentenceRows(page).first().locator('.leaf__commands button')
    const named = await commands.evaluateAll((buttons) =>
      buttons.map((button) => ({
        icons: button.querySelectorAll('svg').length,
        words: button.textContent.trim().length,
      })),
    )
    expect(named).toHaveLength(3)
    expect(named.every((command) => command.icons === 1 && command.words > 0)).toBe(true)
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
