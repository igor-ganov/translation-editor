import { describe, expect, it } from 'vitest'
import { clampPage } from './clamp-page.js'

describe('clampPage', () => {
  it('leaves a page inside the document alone', () => {
    expect(clampPage(14)(3)).toBe(3)
  })

  it('stays on the last page rather than wrapping round to the first', () => {
    expect(clampPage(14)(14)).toBe(13)
  })

  it('stays on the first page rather than going before it', () => {
    expect(clampPage(14)(-1)).toBe(0)
  })

  it('survives a document with no pages at all', () => {
    expect(clampPage(0)(0)).toBe(0)
  })
})
