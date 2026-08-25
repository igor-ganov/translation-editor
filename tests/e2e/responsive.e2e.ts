import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { openDocument, sentenceRows } from './support/open-document.js'

const columnCount = async (page: Page) =>
  await sentenceRows(page)
    .first()
    .evaluate((host) => {
      const grid = host.shadowRoot?.querySelector('.grid')
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns : ''
      return columns.split(' ').filter((value) => value.length > 0).length
    })

test.describe('responsive layout', () => {
  test('stacks source above translation on a narrow screen, with no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await openDocument(page)

    expect(await columnCount(page)).toBe(1)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('puts source and translation side by side once there is room', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await openDocument(page)
    expect(await columnCount(page)).toBe(2)
  })

  test('gives approval controls a comfortable touch target', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await openDocument(page)
    const height = await sentenceRows(page)
      .first()
      .evaluate((host) => host.shadowRoot?.querySelector('label')?.getBoundingClientRect().height ?? 0)
    expect(height).toBeGreaterThanOrEqual(44)
  })
})
