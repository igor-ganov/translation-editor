import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { openDocument, sentenceRows, settle } from './support/open-document.js'

const columnCount = async (page: Page) =>
  await sentenceRows(page)
    .first()
    .evaluate((host) => {
      const pair = host.shadowRoot?.querySelector('.leaf__pair')
      const columns = pair ? getComputedStyle(pair).gridTemplateColumns : ''
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

  test('gives a margin command a comfortable touch target, though it is drawn as a word', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await openDocument(page)
    // The ink is a word; the target has to be a thumb. The hit area is grown by a
    // pseudo-element so the two can differ without the design changing.
    const box = await settle(sentenceRows(page).nth(1)).evaluate((element) => {
      const after = getComputedStyle(element, '::after')
      const own = element.getBoundingClientRect()
      return own.height + Math.abs(Number.parseFloat(after.top)) * 2
    })
    expect(box).toBeGreaterThanOrEqual(44)
  })

  test('keeps the page turner reachable at the bottom of a phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await openDocument(page)
    const height = await page
      .locator('te-app')
      .locator('te-editor')
      .evaluate((host) => host.shadowRoot?.querySelector('.turner')?.getBoundingClientRect().height ?? 0)
    expect(height).toBeGreaterThanOrEqual(44)
  })
})
