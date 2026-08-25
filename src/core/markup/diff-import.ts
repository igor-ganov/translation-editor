import { Option, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { knownSegmentIds } from './import/known-segment-ids.js'
import { classifyIncoming } from './import/classify-incoming.js'
import type { Verdict } from './import/classify-incoming.js'
import type { ParsedMarkup } from './types.js'

export type ImportDiff = {
  readonly documentMatches: boolean
  readonly added: readonly SegmentId[]
  readonly changed: readonly SegmentId[]
  readonly unchanged: readonly SegmentId[]
  readonly unknownIds: readonly SegmentId[]
  readonly missingIds: readonly SegmentId[]
  readonly approvalsToClear: readonly SegmentId[]
}

const isApproved = (project: Project) => (id: SegmentId): boolean =>
  pipe(
    lookupEntry(project.entries)(id),
    Option.map((entry) => entry.approved),
    Option.getOrElse(() => false),
  )

const idsWhere = (
  verdicts: readonly (readonly [SegmentId, Verdict])[],
  wanted: Verdict,
): readonly SegmentId[] => verdicts.filter(([, verdict]) => verdict === wanted).map(([id]) => id)

/**
 * What an import would do, computed before anything is applied. The user confirms
 * against this summary, so it must account for every incoming id and every id the
 * file failed to mention.
 */
export const diffImport =
  (project: Project) =>
  (parsed: ParsedMarkup): ImportDiff => {
    const known = knownSegmentIds(project)
    const classify = classifyIncoming(project)(known)
    const verdicts = [...parsed.segments].map(
      ([id, text]): readonly [SegmentId, Verdict] => [id, classify(id, text)],
    )
    const changed = idsWhere(verdicts, 'changed')
    return {
      documentMatches: parsed.header.documentHash === project.documentHash,
      added: idsWhere(verdicts, 'added'),
      changed,
      unchanged: idsWhere(verdicts, 'unchanged'),
      unknownIds: idsWhere(verdicts, 'unknown'),
      missingIds: [...known].filter((id) => !parsed.segments.has(id)),
      approvalsToClear: changed.filter(isApproved(project)),
    }
  }
