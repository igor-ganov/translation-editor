import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LONG_OPENINGS, makeLongFixtureDocx } from './fixtures/make-long-fixture-docx.js'
import {
  blockRows,
  contents,
  editor,
  nextPage,
  openContents,
  openFile,
  previousPage,
  reading,
  sentenceRows,
  writeIn,
} from './support/open-document.js'

const folio = (page: Page) => editor(page).locator('.turner__folio')
const openLong = async (page: Page) => openFile(page, await makeLongFixtureDocx())

/**
 * A document is cut into pages rather than left as one endless scroll, and the
 * bookmark is a page and a segment rather than a pixel offset. Both exist because
 * a long document was unreadable on a phone and jumped to its end on any redraw.
 */
test.describe('pages', () => {
  test('cuts a long document into more than one page', async ({ page }) => {
    await openLong(page)
    await expect(folio(page)).toContainText('1 / 3')
    await expect(blockRows(page)).toHaveCount(3)
  })

  test('turns forward and back, landing on different paragraphs', async ({ page }) => {
    await openLong(page)
    await expect(blockRows(page).first().locator('.leaf__source')).toContainText(LONG_OPENINGS[0] ?? '')

    await nextPage(page).click()
    await expect(folio(page)).toContainText('2 / 3')
    await expect(blockRows(page).first().locator('.leaf__source')).toContainText(LONG_OPENINGS[3] ?? '')

    await previousPage(page).click()
    await expect(folio(page)).toContainText('1 / 3')
    await expect(blockRows(page).first().locator('.leaf__source')).toContainText(LONG_OPENINGS[0] ?? '')
  })

  test('stops at each end rather than wrapping round', async ({ page }) => {
    await openLong(page)
    await expect(previousPage(page)).toBeDisabled()
    await expect(nextPage(page)).toBeEnabled()

    await nextPage(page).click()
    await nextPage(page).click()
    await expect(folio(page)).toContainText('3 / 3')
    await expect(nextPage(page)).toBeDisabled()
  })

  test('never splits a paragraph across a page turn', async ({ page }) => {
    await openLong(page)
    for (const turn of [0, 1]) {
      expect(turn).toBeGreaterThanOrEqual(0)
      const first = await editor(page).locator('[role="list"] > *').first().evaluate((el) => el.tagName)
      expect(first).toBe('TE-BLOCK-ROW')
      await nextPage(page).click()
    }
  })

  test('lists every page in the contents, with what is left to do on it', async ({ page }) => {
    await openLong(page)
    await openContents(page)
    await expect(contents(page).locator('.contents li')).toHaveCount(3)
    await expect(contents(page).locator('.contents__state').first()).toHaveText('untouched')
    await expect(contents(page).locator('.contents li[aria-current="page"]')).toHaveCount(1)
  })

  test('turns to a page chosen from the contents', async ({ page }) => {
    await openLong(page)
    await openContents(page)
    await contents(page).locator('.contents__row').nth(2).click()
    await editor(page).waitFor()
    await expect(folio(page)).toContainText('3 / 3')
  })

  test('reopens on the page that was being read, not at the end of the document', async ({ page }) => {
    // The bug this replaces: a stored pixel offset threw the reader to the end of
    // the document whenever anything unrelated redrew.
    await openLong(page)
    await nextPage(page).click()
    const row = sentenceRows(page).first()
    await writeIn(row, 'a translation on page two')

    await page.reload()
    await editor(page).waitFor()
    await expect(folio(page)).toContainText('2 / 3')
    await expect(reading(sentenceRows(page).first())).toHaveText('a translation on page two')
  })
})
