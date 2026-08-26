import { describe, expect, it } from 'vitest'
import { pageStateWords } from './page-state-words.js'

const summary = (total: number, translated: number, approved: number) => ({
  title: 'A page',
  total,
  translated,
  approved,
})

describe('pageStateWords', () => {
  it('calls a fully approved page done', () => {
    expect(pageStateWords(summary(9, 9, 9))).toBe('all approved')
  })

  it('calls a page nobody has reached not translated', () => {
    expect(pageStateWords(summary(9, 0, 0))).toBe('not translated')
  })

  it('distinguishes translated-but-unapproved from not translated at all', () => {
    expect(pageStateWords(summary(9, 9, 0))).toBe('translated, none approved')
  })

  it('counts the approved ones when a page is part way through', () => {
    expect(pageStateWords(summary(9, 9, 2))).toBe('2 of 9 approved')
  })

  it('says a page with nothing translatable on it has nothing to do', () => {
    expect(pageStateWords(summary(0, 0, 0))).toBe('nothing to translate')
  })
})
