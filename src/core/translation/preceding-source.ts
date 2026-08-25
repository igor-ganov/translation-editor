import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'
import { precedingBlocks } from './preceding-blocks.js'

/** Source text of the paragraphs just before a batch. Never translated, only read. */
export const precedingSource =
  (project: Project) =>
  (batch: Batch): string =>
    precedingBlocks(project)(batch)
      .map((block) => block.text.trim())
      .filter((text) => text.length > 0)
      .join('\n\n')
