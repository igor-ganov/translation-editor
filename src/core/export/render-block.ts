import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { effectiveTranslation } from '../translation/effective-translation.js'
import { deriveBlockApproval } from '../approval/derive-block-approval.js'
import type { ExportMode, RenderedBlock } from './types.js'

const fromSource = (block: Block): RenderedBlock => ({ text: block.text, fallback: true })

const translated = (text: string): RenderedBlock => ({ text, fallback: false })

const anyTranslation = (project: Project) => (block: Block): RenderedBlock =>
  pipe(effectiveTranslation(project)(block), Option.map(translated), Option.getOrElse(() => fromSource(block)))

/** Only text the user signed off on is emitted; everything else falls back to source. */
const approvedOnly = (project: Project) => (block: Block): RenderedBlock =>
  pipe(
    Option.liftPredicate((candidate: Block) => deriveBlockApproval(project)(candidate))(block),
    Option.flatMap((approved) => effectiveTranslation(project)(approved)),
    Option.map(translated),
    Option.getOrElse(() => fromSource(block)),
  )

const STRATEGIES: Record<ExportMode, (project: Project) => (block: Block) => RenderedBlock> = {
  all: anyTranslation,
  approvedOnly,
}

/**
 * The text one paragraph contributes to the exported document. A block is never
 * omitted: where there is nothing to show, the source text is emitted and marked,
 * so a gap in the translation is visible in the document rather than silently lost.
 */
export const renderBlock =
  (project: Project) =>
  (mode: ExportMode) =>
  (block: Block): RenderedBlock =>
    STRATEGIES[mode](project)(block)
