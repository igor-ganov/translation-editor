import type { SegmentId } from '../document/types.js'
import type { Batch } from './plan-batches.js'

/** The segment ids a batch is asking the service to return. */
export const idsOf = (batch: Batch): readonly SegmentId[] =>
  batch.sentences.map((sentence) => sentence.id)
