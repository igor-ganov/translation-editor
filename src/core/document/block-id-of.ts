import { Brand } from 'effect'
import type { BlockId, SegmentId } from './types.js'

const brand = Brand.nominal<BlockId>()

/** The block a segment belongs to. A block id is its own owner. */
export const blockIdOf = (id: SegmentId): BlockId => brand(id.split('.')[0] ?? id)
