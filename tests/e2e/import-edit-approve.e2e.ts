import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  blockRows,
  desk,
  editor,
  openDesk,
  openDocument,
  reading,
  sentenceRows,
  approve,
  writeIn,
} from './support/open-document.js'

const draft = async (page: Page, index: number, text: string): Promise<void> =>
  writeIn(sentenceRows(page).nth(index), text)

test.describe('importing, editing and approving', () => {
  test('imports a .docx and shows every paragraph with its sentences', async ({ page }) => {
    await openDocument(page)
    await expect(blockRows(page)).toHaveCount(3)
    await expect(sentenceRows(page)).toHaveCount(4)
  })

  test('does not split a sentence on an abbreviation', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page).nth(1).locator('.leaf__source')).toHaveText(
      'Dr. Ellison had waited thirty years.',
    )
  })

  test('shows a translation as text, in full, rather than clipped to one line', async ({ page }) => {
    // A translation loaded into a one-line field was shown clipped while the
    // source beside it flowed over six lines.
    await openDocument(page)
    const row = sentenceRows(page).first()
    const long = 'A rendering long enough to need three lines of its own, which is the ordinary case for prose.'
    await draft(page, 0, long)

    await expect(reading(row)).toHaveText(long)
    // One rect per line box, which a block element's own bounding box cannot tell you.
    const lines = await reading(row).evaluate((element) => {
      const range = element.ownerDocument.createRange()
      range.selectNodeContents(element)
      return range.getClientRects().length
    })
    expect(lines).toBeGreaterThan(1)
  })

  test('keeps an edited translation across a reload', async ({ page }) => {
    await openDocument(page)
    await draft(page, 0, 'The Silent Observer, translated')
    await openDesk(page)
    await expect(desk(page).locator('.thread__count')).toContainText('1 translated')

    await page.reload()
    await editor(page).waitFor()
    await expect(reading(sentenceRows(page).first())).toHaveText('The Silent Observer, translated')
  })

  test('editing unapproves a sentence, because the approved text has changed', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await draft(page, 0, 'a first attempt')
    await approve(row).click()
    await expect(approve(row)).toHaveAttribute('aria-pressed', 'true')

    await draft(page, 0, 'a second attempt')
    await expect(approve(row)).toHaveAttribute('aria-pressed', 'false')
  })

  test('a translation with no text cannot be approved', async ({ page }) => {
    await openDocument(page)
    await expect(approve(sentenceRows(page).first())).toBeDisabled()
  })

  test('approving every sentence of a paragraph reports the paragraph as approved', async ({ page }) => {
    await openDocument(page)
    for (const index of [1, 2]) {
      await draft(page, index, `translation ${String(index)}`)
      await approve(sentenceRows(page).nth(index)).click()
    }
    await expect(approve(sentenceRows(page).nth(1))).toHaveAttribute('aria-pressed', 'true')
    await expect(approve(blockRows(page).nth(1))).toHaveAttribute('aria-pressed', 'true')
  })

  test('approving a paragraph cascades to its sentences and unapproving reverses it', async ({ page }) => {
    await openDocument(page)
    for (const index of [1, 2]) await draft(page, index, `translation ${String(index)}`)

    const paragraph = blockRows(page).nth(1)
    await approve(paragraph).click()
    await expect(approve(sentenceRows(page).nth(1))).toHaveAttribute('aria-pressed', 'true')
    await expect(approve(sentenceRows(page).nth(2))).toHaveAttribute('aria-pressed', 'true')

    await approve(paragraph).click()
    await expect(approve(sentenceRows(page).nth(1))).toHaveAttribute('aria-pressed', 'false')
    await expect(approve(sentenceRows(page).nth(2))).toHaveAttribute('aria-pressed', 'false')
  })
})
