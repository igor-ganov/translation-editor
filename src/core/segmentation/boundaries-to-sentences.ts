import type { BlockId, Sentence } from '../document/types.js'
import { makeSentenceId } from '../document/make-sentence-id.js'

/**
 * Turns consecutive boundary offsets into sentences. Ordinals start at zero for a
 * freshly imported block; later splits continue from the block's stored counter.
 */
export const boundariesToSentences =
  (blockId: BlockId) =>
  (firstOrdinal: number) =>
  (boundaries: readonly number[]): readonly Sentence[] =>
    boundaries.slice(0, -1).map((start, index) => ({
      id: makeSentenceId(blockId)(firstOrdinal + index),
      start,
      end: boundaries[index + 1] ?? start,
    }))
