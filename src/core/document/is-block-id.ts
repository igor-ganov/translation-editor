import type { BlockId, SegmentId } from './types.js'

/** Narrows a segment id to a block id; sentence ids always carry a `.s` part. */
export const isBlockId = (id: SegmentId): id is BlockId => !id.includes('.')
