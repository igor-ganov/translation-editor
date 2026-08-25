import { Brand } from 'effect'
import type { BlockId, SentenceId } from './types.js'

const brand = Brand.nominal<SentenceId>()

/**
 * The ordinal comes from a per-block monotonic counter, never from the sentence's
 * position, so splitting or merging leaves untouched sentences' ids alone and a
 * retired id is never reissued.
 */
export const makeSentenceId =
  (blockId: BlockId) =>
  (ordinal: number): SentenceId =>
    brand(`${blockId}.s${String(ordinal)}`)
