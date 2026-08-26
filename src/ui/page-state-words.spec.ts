import { describe, expect, it } from 'vitest'
import { pageStateWords } from './page-state-words.js'

const summary = (total: number, translated: number, approved: number) => ({
  title: 'A page',
  total,
  translated,
  approved,
})

describe('pageStateWords', () => {
  it('calls a fully settled page finished', () => {
    expect(pageStateWords(summary(9, 9, 9))).toBe('finished')
  })

  it('calls a page nobody has reached untouched', () => {
    expect(pageStateWords(summary(9, 0, 0))).toBe('untouched')
  })

  it('distinguishes drafted-but-unsettled from untouched', () => {
    expect(pageStateWords(summary(9, 9, 0))).toBe('drafted, none settled')
  })

  it('counts the settled ones when a page is part way through', () => {
    expect(pageStateWords(summary(9, 9, 2))).toBe('2 of 9 settled')
  })

  it('says a page with nothing translatable on it has nothing to do', () => {
    expect(pageStateWords(summary(0, 0, 0))).toBe('nothing to translate')
  })
})
