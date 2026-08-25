import type { LanguageTag } from '../document/types.js'

/**
 * Sentence start offsets reported by the platform segmenter, plus a terminating
 * offset at the end of the text, so consecutive pairs describe every sentence.
 */
export const rawBoundaries =
  (language: LanguageTag) =>
  (text: string): readonly number[] => {
    const segmenter = new Intl.Segmenter(language, { granularity: 'sentence' })
    return [...Array.from(segmenter.segment(text), (piece) => piece.index), text.length]
  }
