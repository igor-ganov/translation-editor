import { Option } from 'effect'
import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'
import { precedingBlocks } from './preceding-blocks.js'
import { effectiveTranslation } from './effective-translation.js'

/**
 * The translation already produced for the paragraphs just before a batch.
 *
 * This is the piece that keeps a long document coherent. Terminology settled
 * earlier stays settled, and a pronoun can agree with the noun that was actually
 * chosen rather than with whatever the model would pick afresh.
 */
export const precedingTarget =
  (project: Project) =>
  (batch: Batch): string =>
    precedingBlocks(project)(batch)
      .flatMap((block) => Option.toArray(effectiveTranslation(project)(block)))
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .join('\n\n')
