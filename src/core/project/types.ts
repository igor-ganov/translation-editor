import type { Block, BlockId, LanguageTag, ProjectId, SegmentId } from '../document/types.js'

export type TranslationState =
  | { readonly tag: 'absent' }
  | { readonly tag: 'machine'; readonly text: string }
  | { readonly tag: 'edited'; readonly text: string }
  | { readonly tag: 'failed'; readonly reason: string }

export type Entry = {
  readonly translation: TranslationState
  readonly approved: boolean
}

export type LanguagePair = {
  readonly from: LanguageTag
  readonly to: LanguageTag
}

export type Project = {
  readonly id: ProjectId
  readonly name: string
  /** SHA-256 of the imported .docx bytes; matched on markup import. */
  readonly documentHash: string
  readonly source: readonly Block[]
  readonly languages: LanguagePair
  readonly entries: ReadonlyMap<SegmentId, Entry>
  /** Per block, the next never-yet-used sentence ordinal. Retired ids stay retired. */
  readonly nextSentenceOrdinal: ReadonlyMap<BlockId, number>
  readonly cursor: SegmentId | undefined
  readonly createdAt: number
  readonly updatedAt: number
}
