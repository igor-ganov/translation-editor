import { Option, pipe } from 'effect'
import type { BlockId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from './translation-text.js'

/**
 * A block's own translation, when it has a non-empty one. Its presence is what
 * makes the block override its sentences (R5.2); an empty one does not count.
 */
export const blockOverride =
  (project: Project) =>
  (blockId: BlockId): Option.Option<string> =>
    pipe(
      lookupEntry(project.entries)(blockId),
      Option.flatMap((entry) => translationText(entry.translation)),
    )
