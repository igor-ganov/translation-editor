import { Option, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from '../translation/translation-text.js'

/**
 * A segment can only be approved once it actually says something. Failed attempts
 * and whitespace-only results are not approvable, which keeps the progress figure
 * from counting work that was never done.
 */
export const canApprove =
  (project: Project) =>
  (id: SegmentId): boolean =>
    pipe(
      lookupEntry(project.entries)(id),
      Option.flatMap((entry) => translationText(entry.translation)),
      Option.isSome,
    )
