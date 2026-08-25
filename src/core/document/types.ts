import type { Brand } from 'effect'

/**
 * Branded identifiers keep block and sentence ids from being swapped by accident.
 * Effect's Brand is used rather than an intersection with a phantom field so that
 * values can be constructed without a type assertion.
 */
export type BlockId = string & Brand.Brand<'BlockId'>
export type SentenceId = string & Brand.Brand<'SentenceId'>
export type SegmentId = BlockId | SentenceId
export type ProjectId = string & Brand.Brand<'ProjectId'>

/** BCP-47 subset the app ships with; extending it needs no UI change. */
export type LanguageTag = 'en' | 'ru' | 'it'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type BlockKind =
  | { readonly tag: 'paragraph' }
  | { readonly tag: 'heading'; readonly level: HeadingLevel }
  | { readonly tag: 'listItem'; readonly ordered: boolean; readonly depth: number }
  | { readonly tag: 'tableCell'; readonly row: number; readonly column: number }

export type Run = {
  readonly start: number
  readonly end: number
  readonly bold: boolean
  readonly italic: boolean
  readonly underline: boolean
}

/**
 * A sentence is a half-open range into its block's text, never a copy of it.
 * This makes "the sentences always reconstruct the block" a structural invariant
 * rather than something to assert after every edit.
 */
export type Sentence = {
  readonly id: SentenceId
  readonly start: number
  readonly end: number
}

export type Block = {
  readonly id: BlockId
  readonly kind: BlockKind
  readonly text: string
  readonly runs: readonly Run[]
  readonly sentences: readonly Sentence[]
  readonly translatable: boolean
}
