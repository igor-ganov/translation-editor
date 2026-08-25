import { Option, pipe } from 'effect'
import type { BlockId, LanguageTag, Sentence } from '../document/types.js'
import { abbreviationPattern } from './abbreviation-pattern.js'
import { rawBoundaries } from './raw-boundaries.js'
import { dropAbbreviationBoundaries } from './drop-abbreviation-boundaries.js'
import { boundariesToSentences } from './boundaries-to-sentences.js'

export type Segmentation = {
  readonly sentences: readonly Sentence[]
  readonly nextOrdinal: number
}

const EMPTY: Segmentation = { sentences: [], nextOrdinal: 0 }

const hasContent = (text: string): boolean => text.trim().length > 0

const build =
  (language: LanguageTag, blockId: BlockId) =>
  (text: string): Segmentation => {
    const sentences = pipe(
      rawBoundaries(language)(text),
      dropAbbreviationBoundaries(abbreviationPattern(language))(text),
      boundariesToSentences(blockId)(0),
    )
    return { sentences, nextOrdinal: sentences.length }
  }

/**
 * Splits a block's text into sentences: the platform segmenter for UAX #29 rules,
 * then a per-language pass that reattaches abbreviations the standard splits wrongly.
 * The resulting ranges tile the text exactly, so the block can always be rebuilt.
 */
export const segmentSentences =
  (language: LanguageTag) =>
  (blockId: BlockId) =>
  (text: string): Segmentation =>
    pipe(
      Option.liftPredicate(hasContent)(text),
      Option.map(build(language, blockId)),
      Option.getOrElse(() => EMPTY),
    )
