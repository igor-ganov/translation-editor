import { expect, test } from '@playwright/test'
import {
  app,
  blockRows,
  chooseFilter,
  leaveDesk,
  openDocument,
  runFromDesk,
  sentenceRows,
  settle,
  writeIn,
} from './support/open-document.js'

test.describe('moving around the document', () => {
  test('goes to the next sentence still waiting to be settled', async ({ page }) => {
    await openDocument(page)
    const first = sentenceRows(page).first()
    await writeIn(first, 'translated')
    await settle(first).click()

    await runFromDesk(page, 'Next page needing work')
    await expect(app(page).locator('.notice')).toHaveCount(0)
  })

  test('says so when there is nothing left to settle in the view', async ({ page }) => {
    await openDocument(page)
    await chooseFilter(page, 'Went wrong')
    await runFromDesk(page, 'Next page needing work')
    await expect(app(page).locator('.notice')).toContainText('Nothing left to settle')
  })

  test('filters the view down to untranslated sentences', async ({ page }) => {
    await openDocument(page)
    const first = sentenceRows(page).first()
    await writeIn(first, 'translated')

    await chooseFilter(page, 'Not translated')
    await expect(sentenceRows(page)).toHaveCount(3)
    await expect(sentenceRows(page).first().locator('.leaf__source')).not.toHaveText('The Silent Observer')
  })

  test('folds a paragraph down to its opening and unfolds it again', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page)).toHaveCount(4)

    const toggle = blockRows(page).first().getByRole('button', { name: /sentences/ })
    await toggle.click()
    await expect(sentenceRows(page)).toHaveCount(3)
    await toggle.click()
    await expect(sentenceRows(page)).toHaveCount(4)
  })

  test('undoes a sentence join as one step', async ({ page }) => {
    await openDocument(page)
    await expect(sentenceRows(page)).toHaveCount(4)

    await sentenceRows(page).nth(1).getByRole('button', { name: 'join' }).click()
    await expect(sentenceRows(page)).toHaveCount(3)

    await runFromDesk(page, /^Undo/)
    await leaveDesk(page)
    await expect(sentenceRows(page)).toHaveCount(4)
  })
})
