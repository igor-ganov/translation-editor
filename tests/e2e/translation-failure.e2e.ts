import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { app, desk, editor, openDesk, openDocument, sentenceRows } from './support/open-document.js'

const settings = (page: Page) => app(page).locator('te-settings')
const notice = (page: Page) => app(page).locator('.notice')

/**
 * Points the application at a service that will refuse it, without leaving the
 * machine: the test server answers the completions path with a 404. A real key
 * and a real endpoint are not needed to prove that a refusal is reported.
 */
const useARefusingService = async (page: Page): Promise<void> => {
  await openDesk(page)
  await desk(page).getByRole('button', { name: 'Settings' }).click()
  await settings(page).waitFor()
  await settings(page).locator('select[name="providerId"]').selectOption('llamacpp')
  await settings(page).locator('input[name="baseUrl"]').fill('http://localhost:4323/refusing-service')
  await settings(page).getByRole('button', { name: 'Save' }).click()
  // Settings reached from a document's desk returns to that document, not to the
  // shelf: changing a setting mid-document should not cost the reader their place.
  await settings(page).getByRole('button', { name: 'Back to the document' }).click()
  await editor(page).waitFor()
  // Clear "Settings saved." so the next message on screen is unambiguously the
  // one this test is about.
  await notice(page).getByRole('button', { name: 'Dismiss this message' }).click()
  await expect(notice(page)).toHaveCount(0)
}

const translate = async (page: Page): Promise<void> => {
  await openDesk(page)
  await desk(page).getByRole('button', { name: /^Translate \d+ sentences$/ }).click()
  await expect(notice(page)).toContainText('sentences failed', { timeout: 20_000 })
}

test.describe('a translation that is refused', () => {
  test('says why, and offers the record from the message itself', async ({ page }) => {
    await openDocument(page)
    await useARefusingService(page)
    await translate(page)

    // The whole point: the reason reaches the reader rather than being stored
    // and forgotten, and the record is reachable from the failure that needs it.
    await expect(notice(page)).toContainText('The service said')
    await expect(notice(page)).toContainText('Your credit balance is too low')
    // The sentence, not the envelope it arrived in.
    await expect(notice(page)).not.toContainText('invalid_request_error')
    await expect(notice(page).getByRole('button', { name: 'Save the record' })).toBeVisible()
  })

  test('counts the run that was just started, not the whole document', async ({ page }) => {
    await openDocument(page)
    await useARefusingService(page)
    await translate(page)

    // Nothing was translated, so the message must not report a number as though
    // it had been. Four sentences were attempted and all four were refused.
    await expect(notice(page)).toContainText('Nothing was translated')
    await expect(notice(page)).toContainText('4 sentences')
  })

  test('prints the reason beside every sentence it applies to', async ({ page }) => {
    await openDocument(page)
    await useARefusingService(page)
    await translate(page)

    await desk(page).getByRole('button', { name: 'Back to the page' }).click()
    const row = sentenceRows(page).first()
    await expect(row.locator('.mark')).toHaveText('went wrong')
    await expect(row.locator('.failure')).toHaveText('Your credit balance is too low to access the Anthropic API.')
  })
})
