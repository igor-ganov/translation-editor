import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'

/**
 * Source text surrounding the batch, supplied so the model can resolve pronouns
 * and grammatical gender. It is labelled "do not translate" in the prompt and
 * never appears in the reply, which reconciliation enforces by id.
 */
export const batchContext =
  (project: Project) =>
  (batch: Batch): string => {
    const blockIds = new Set(batch.sentences.map((sentence) => sentence.blockId))
    return project.source
      .filter((block) => blockIds.has(block.id))
      .map((block) => block.text)
      .join('\n\n')
      .slice(0, 4000)
  }
