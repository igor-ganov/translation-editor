import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Download, Page } from '@playwright/test'
import { blockRows, editor, openDocument, sentenceRows } from './support/open-document.js'

/**
 * "Export markup" writes both sides, so two downloads arrive. They are collected
 * from the event stream rather than with two `waitForEvent` calls, which would
 * both resolve on whichever download happens to arrive first.
 */
const exportMarkup = async (page: Page): Promise<readonly Download[]> => {
  const collected: Download[] = []
  page.on('download', (download) => collected.push(download))
  await editor(page).getByRole('button', { name: 'Export markup' }).click()
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
  await editor(page).getByRole('button', { name: 'Import markup' }).click()
  await (await chooser).setFiles(path)
}

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
      .replace('⟦b0.s0⟧', '⟦b0.s0⟧Молчаливый наблюдатель')
      .replace('⟦b1.s0⟧', '⟦b1.s0⟧Доктор Эллисон ждал тридцать лет.')

    await importMarkup(page, filled)

    const panel = page.locator('te-app').locator('.confirm')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Translations to add: 2')
    await expect(panel).toContainText('Approvals that will be cleared: 0')

    await panel.getByRole('button', { name: 'Apply' }).click()
    await expect(panel).toHaveCount(0)
    await expect(sentenceRows(page).first().locator('textarea')).toHaveValue('Молчаливый наблюдатель')
  })

  test('refuses nothing but warns when the file belongs to another document', async ({ page }) => {
    await openDocument(page)
    const translation = await sideOf(await exportMarkup(page), 'translation')
    await importMarkup(page, translation.replace(/#!doc .*/, '#!doc some-other-document'))

    const panel = page.locator('te-app').locator('.confirm')
    await expect(panel.locator('.warning')).toBeVisible()
  })

  test('exports a .docx the browser accepts as a download', async ({ page }) => {
    await openDocument(page)
    const row = sentenceRows(page).first()
    await row.locator('textarea').fill('Молчаливый наблюдатель')
    await row.locator('textarea').blur()

    const started = page.waitForEvent('download')
    await editor(page).getByRole('button', { name: 'Export .docx' }).click()
    const file = await started

    expect(file.suggestedFilename()).toMatch(/\.ru\.docx$/)
    const bytes = await readFile(await file.path())
    expect(bytes.subarray(0, 2).toString('latin1')).toBe('PK')
    await expect(blockRows(page)).toHaveCount(3)
  })
})
