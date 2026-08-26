import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Download, Page } from '@playwright/test'
import {
  app,
  blockRows,
  desk,
  field,
  openDesk,
  openDocument,
  sentenceRows,
} from './support/open-document.js'

/**
 * Exporting the markup writes both sides, so two downloads arrive. They are
 * collected from the event stream rather than with two `waitForEvent` calls,
 * which would both resolve on whichever download happens to arrive first.
 */
const exportMarkup = async (page: Page): Promise<readonly Download[]> => {
  const collected: Download[] = []
  page.on('download', (download) => collected.push(download))
  await openDesk(page)
  await desk(page).getByRole('button', { name: 'Marked-up text' }).click()
  await expect.poll(() => collected.length).toBe(2)
  return collected
}

const textOf = async (download: Download): Promise<string> => await readFile(await download.path(), 'utf8')

const sideOf = async (downloads: readonly Download[], kind: string): Promise<string> => {
  const texts = await Promise.all(downloads.map(textOf))
  return texts.find((text) => text.includes(`#!kind ${kind}`)) ?? ''
}

const importMarkup = async (page: Page, contents: string): Promise<void> => {
  const path = join(await mkdtemp(join(tmpdir(), 'te-markup-')), 'edited.tmarkup.txt')
  await writeFile(path, contents, 'utf8')
  const chooser = page.waitForEvent('filechooser')
  await desk(page).getByRole('button', { name: 'Bring a translation back' }).click()
  await (await chooser).setFiles(path)
}

const slip = (page: Page) => app(page).locator('.slip')

test.describe('the markup round trip', () => {
  test('exports the source with a marker for every segment', async ({ page }) => {
    await openDocument(page)
    const source = await sideOf(await exportMarkup(page), 'source')

    expect(source).toContain('#!translation-editor v1')
    expect(source).toContain('#!lang en>ru')
    expect(source).toContain('⟦b0⟧The Silent Observer')
    expect(source).toContain('⟦b1.s0⟧Dr. Ellison had waited thirty years.')
  })

  test('applies an externally translated file after showing what it will do', async ({ page }) => {
    await openDocument(page)
    const translation = await sideOf(await exportMarkup(page), 'translation')
    const filled = translation
      .replace('⟦b0.s0⟧', '⟦b0.s0⟧The Silent Observer, rendered')
      .replace('⟦b1.s0⟧', '⟦b1.s0⟧Doctor Ellison waited thirty years.')

    await importMarkup(page, filled)

    await expect(slip(page)).toBeVisible()
    await expect(slip(page)).toContainText('Translations added')
    await expect(slip(page)).toContainText('Settled sentences that will stop being settled')

    await slip(page).getByRole('button', { name: 'Bring it in' }).click()
    await expect(slip(page)).toHaveCount(0)
    await desk(page).getByRole('button', { name: 'Back to the page' }).click()
    await expect(field(sentenceRows(page).first())).toHaveValue('The Silent Observer, rendered')
  })

  test('refuses nothing but warns when the file belongs to another document', async ({ page }) => {
    await openDocument(page)
    const translation = await sideOf(await exportMarkup(page), 'translation')
    await importMarkup(page, translation.replace(/#!doc .*/, '#!doc some-other-document'))

    await expect(slip(page).locator('.warning')).toBeVisible()
  })

  test('exports a .docx the browser accepts as a download', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await field(row).fill('The Silent Observer, rendered')
    await field(row).blur()

    const started = page.waitForEvent('download')
    await openDesk(page)
    await desk(page).getByRole('button', { name: 'Word document' }).click()
    const file = await started

    expect(file.suggestedFilename()).toMatch(/\.ru\.docx$/)
    const bytes = await readFile(await file.path())
    expect(bytes.subarray(0, 2).toString('latin1')).toBe('PK')
    await desk(page).getByRole('button', { name: 'Back to the page' }).click()
    await expect(blockRows(page)).toHaveCount(3)
  })
})
