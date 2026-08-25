import { Option, pipe } from 'effect'
import type { Block, SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from '../translation/translation-text.js'
import type { MarkupKind } from './types.js'

export type MarkupPair = { readonly id: SegmentId; readonly text: string }

const translationOf = (project: Project) => (id: SegmentId): string =>
  pipe(
    lookupEntry(project.entries)(id),
    Option.flatMap((entry) => translationText(entry.translation)),
    Option.getOrElse(() => ''),
  )

const sourcePairs = () => (block: Block): readonly MarkupPair[] => [
  { id: block.id, text: block.text.trim() },
  ...block.sentences.map((sentence) => ({
    id: sentence.id,
    text: block.text.slice(sentence.start, sentence.end).trim(),
  })),
]

const translationPairs = (project: Project) => (block: Block): readonly MarkupPair[] => [
  { id: block.id, text: translationOf(project)(block.id) },
  ...block.sentences.map((sentence) => ({ id: sentence.id, text: translationOf(project)(sentence.id) })),
]

const RENDERERS: Record<MarkupKind, (project: Project) => (block: Block) => readonly MarkupPair[]> = {
  source: sourcePairs,
  translation: translationPairs,
}

/**
 * Every segment of the document in order, block line first then its sentences.
 * The block line is always emitted even when empty: it is the slot an external
 * translator types into to override the whole paragraph.
 */
export const markupPairs =
  (project: Project) =>
  (kind: MarkupKind): readonly MarkupPair[] =>
    project.source.flatMap(RENDERERS[kind](project))
