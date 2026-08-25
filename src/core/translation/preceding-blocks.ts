import { Option } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'

/** How many paragraphs before the batch are worth carrying as context. */
const LOOK_BACK = 2

/**
 * The paragraphs immediately before a batch, in document order.
 *
 * Genuinely before it — the ones a thought may have started in — rather than the
 * batch's own paragraphs, which the model is already being sent.
 */
export const precedingBlocks =
  (project: Project) =>
  (batch: Batch): readonly Block[] => {
    const first = Option.map(
      Option.fromIterable(batch.sentences),
      (sentence) => project.source.findIndex((block) => block.id === sentence.blockId),
    )
    return Option.match(first, {
      onNone: (): readonly Block[] => [],
      onSome: (index) => project.source.slice(Math.max(0, index - LOOK_BACK), Math.max(0, index)),
    })
  }
