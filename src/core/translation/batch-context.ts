import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'
import { precedingSource } from './preceding-source.js'
import { precedingTarget } from './preceding-target.js'

const LIMIT = 4000

/**
 * What the model is shown besides the segments it must translate.
 *
 * Two things, and the second one is the point. The source of the paragraphs just
 * before the batch, so a thought split across a boundary still reads whole. And
 * the *translation* already produced for those paragraphs — which is what fixes
 * the drift between batches, because a pronoun in Russian must agree in gender
 * with a noun that was chosen earlier, and the only way to agree with a decision
 * is to be shown the decision rather than the sentence that prompted it.
 *
 * An earlier version passed the batch's own paragraphs here, which told the model
 * nothing it did not already have.
 */
export const batchContext =
  (project: Project) =>
  (batch: Batch): string =>
    [
      `Preceding source:\n${precedingSource(project)(batch)}`,
      `Already translated, keep terms and gender consistent with this:\n${precedingTarget(project)(batch)}`,
    ]
      .join('\n\n')
      .slice(0, LIMIT)
