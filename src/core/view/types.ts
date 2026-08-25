import type { Block, SegmentId, Sentence } from '../document/types.js'
import type { TranslationState } from '../project/types.js'

export type SegmentFilter = 'all' | 'untranslated' | 'unapproved' | 'failed'

export type BlockRow = {
  readonly tag: 'block'
  readonly id: SegmentId
  readonly block: Block
  readonly translation: TranslationState
  readonly approved: boolean
  /** True when this block's own translation is overriding its sentences. */
  readonly overriding: boolean
  readonly collapsed: boolean
  readonly sentenceCount: number
}

export type SentenceRow = {
  readonly tag: 'sentence'
  readonly id: SegmentId
  readonly blockId: SegmentId
  readonly sentence: Sentence
  readonly source: string
  readonly translation: TranslationState
  readonly approved: boolean
  /** True when the parent block overrides it, so the editor can show it as inert. */
  readonly superseded: boolean
}

export type EditorRow = BlockRow | SentenceRow
