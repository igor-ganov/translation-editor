import { Option } from 'effect'
import type { Block, SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { blockOverride } from '../translation/block-override.js'
import { deriveBlockApproval } from '../approval/derive-block-approval.js'
import { entryOf } from './entry-of.js'
import { sentenceRows } from './sentence-rows.js'
import type { BlockRow, EditorRow, SegmentFilter } from './types.js'

const blockRow =
  (project: Project) =>
  (collapsed: ReadonlySet<string>) =>
  (block: Block, overriding: boolean, sentenceCount: number): BlockRow => ({
    tag: 'block',
    id: block.id,
    block,
    translation: entryOf(project)(block.id).translation,
    approved: deriveBlockApproval(project)(block),
    overriding,
    collapsed: collapsed.has(block.id),
    sentenceCount,
  })

const body = (isCollapsed: boolean, sentences: readonly EditorRow[]): readonly EditorRow[] => {
  switch (isCollapsed) {
    case true:
      return []
    case false:
      return sentences
  }
}

const rowsFor =
  (project: Project, filter: SegmentFilter, collapsed: ReadonlySet<string>) =>
  (block: Block): readonly EditorRow[] => {
    const overriding = Option.isSome(blockOverride(project)(block.id))
    const sentences = sentenceRows(project)(filter, overriding)(block)
    const header = blockRow(project)(collapsed)(block, overriding, sentences.length)
    switch (sentences.length === 0 && filter !== 'all') {
      case true:
        // Nothing in this paragraph matches the filter, so the paragraph is hidden
        // too — otherwise a filtered view is mostly empty headers.
        return []
      case false:
        return [header, ...body(collapsed.has(block.id), sentences)]
    }
  }

/**
 * The document flattened into one ordered list of rows for the virtualised view:
 * a paragraph header followed by its sentence pairs, unless it is collapsed.
 */
export const editorRows =
  (project: Project) =>
  (filter: SegmentFilter, collapsed: ReadonlySet<SegmentId | string>): readonly EditorRow[] =>
    project.source
      .filter((block) => block.translatable)
      .flatMap(rowsFor(project, filter, new Set(collapsed)))
