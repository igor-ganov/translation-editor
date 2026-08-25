import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { blockOverride } from './block-override.js'
import { sentenceComposite } from './sentence-composite.js'

const isTranslatable = (block: Block): boolean => block.translatable

/**
 * The rule the whole application turns on: a paragraph translation is optional, but
 * when present it overrides the paragraph's sentence translations. Export, progress
 * and every UI badge derive from this one function, so the two levels can never
 * disagree about what the document actually says.
 */
export const effectiveTranslation =
  (project: Project) =>
  (block: Block): Option.Option<string> =>
    pipe(
      Option.liftPredicate(isTranslatable)(block),
      Option.flatMap((translatable) =>
        Option.orElse(blockOverride(project)(translatable.id), () =>
          sentenceComposite(project)(translatable),
        ),
      ),
    )
