import { describe, expect, it } from 'vitest'
import { segmentSentences } from './segment-sentences.js'
import { makeBlockId } from '../document/make-block-id.js'

const block = makeBlockId(0)
const texts = (source: string, language: 'en' | 'ru' | 'it') =>
  segmentSentences(language)(block)(source).sentences.map((s) => source.slice(s.start, s.end).trim())

/** The invariant everything else depends on: sentences tile the text exactly. */
const expectContiguous = (source: string, language: 'en' | 'ru' | 'it') => {
  const { sentences } = segmentSentences(language)(block)(source)
  expect(sentences[0]?.start ?? 0).toBe(0)
  expect(sentences.at(-1)?.end ?? 0).toBe(source.length)
  for (const [index, sentence] of sentences.entries()) {
    expect(sentence.start).toBe(index === 0 ? 0 : sentences[index - 1]?.end)
    expect(sentence.end).toBeGreaterThan(sentence.start)
  }
  expect(sentences.map((s) => source.slice(s.start, s.end)).join('')).toBe(source)
}

describe('segmentSentences', () => {
  it('splits plain sentences', () => {
    expect(texts('One thing happened. Then another. And a third!', 'en')).toStrictEqual([
      'One thing happened.',
      'Then another.',
      'And a third!',
    ])
  })

  it('returns no sentences for empty or whitespace-only text', () => {
    expect(segmentSentences('en')(block)('').sentences).toStrictEqual([])
    expect(segmentSentences('en')(block)('   \n ').sentences).toStrictEqual([])
  })

  it('keeps a single unterminated sentence whole', () => {
    expect(texts('A headline with no full stop', 'en')).toStrictEqual([
      'A headline with no full stop',
    ])
  })

  describe('does not split on abbreviations followed by a capital', () => {
    it('English titles', () => {
      expect(texts('Dr. Ellison waited. Mr. Vance did not.', 'en')).toStrictEqual([
        'Dr. Ellison waited.',
        'Mr. Vance did not.',
      ])
    })

    it('Russian address and era forms', () => {
      expect(texts('Он живёт в г. Москва уже год. Это правда.', 'ru')).toStrictEqual([
        'Он живёт в г. Москва уже год.',
        'Это правда.',
      ])
    })

    it('Italian titles', () => {
      expect(texts('Ho visto il Sig. Rossi ieri. Era stanco.', 'it')).toStrictEqual([
        'Ho visto il Sig. Rossi ieri.',
        'Era stanco.',
      ])
    })
  })

  describe('does split after an abbreviation that closes a sentence', () => {
    it('English "etc."', () => {
      expect(texts('Bring bread, milk, etc. Then come home.', 'en')).toStrictEqual([
        'Bring bread, milk, etc.',
        'Then come home.',
      ])
    })

    it('Italian "ecc."', () => {
      expect(texts('Riforme, sussidi, ecc. Resta la crisi.', 'it')).toStrictEqual([
        'Riforme, sussidi, ecc.',
        'Resta la crisi.',
      ])
    })

    it('Russian "и т.д."', () => {
      expect(texts('Хлеб, молоко и т.д. Потом домой.', 'ru')).toStrictEqual([
        'Хлеб, молоко и т.д.',
        'Потом домой.',
      ])
    })
  })

  it('does not split inside decimal numbers', () => {
    expect(texts('The value is 3.14 exactly. Nothing more.', 'en')).toStrictEqual([
      'The value is 3.14 exactly.',
      'Nothing more.',
    ])
  })

  it('keeps a closing quote with the sentence it ends', () => {
    expect(texts('"Stop right there." He did not stop.', 'en')).toStrictEqual([
      '"Stop right there."',
      'He did not stop.',
    ])
  })

  it('treats an ellipsis as one sentence break, not three', () => {
    expect(texts('He hesitated... Then he spoke.', 'en').length).toBe(2)
  })

  it.each([
    ['One. Two. Three.', 'en'],
    ['Dr. Ellison waited. Mr. Vance did not.', 'en'],
    ['Первое предложение. Второе предложение.', 'ru'],
    ['Prima frase. Seconda frase.', 'it'],
    ['   Leading and trailing space.   ', 'en'],
    ['No terminator at all', 'en'],
  ] as const)('tiles %o without gaps or overlaps', (source, language) => {
    expectContiguous(source, language)
  })

  it('assigns ordinals from zero upward and reports the next free ordinal', () => {
    const result = segmentSentences('en')(block)('One. Two. Three.')
    expect(result.sentences.map((s) => s.id)).toStrictEqual(['b0.s0', 'b0.s1', 'b0.s2'])
    expect(result.nextOrdinal).toBe(3)
  })
})
