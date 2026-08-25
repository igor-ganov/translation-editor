import { Brand } from 'effect'
import type { BlockId } from './types.js'

const brand = Brand.nominal<BlockId>()

/** A block's id is fixed at import and never renumbered, even when blocks are edited. */
export const makeBlockId = (index: number): BlockId => brand(`b${String(index)}`)
