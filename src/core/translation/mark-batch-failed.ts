import type { SegmentId } from '../document/types.js'
import type { Entry, Project } from '../project/types.js'

const asFailed = (reason: string): Entry => ({ translation: { tag: 'failed', reason }, approved: false })

/**
 * Records why a batch could not be translated. The run continues with the
 * remaining batches, and these segments stay eligible for a targeted retry.
 */
export const markBatchFailed =
  (project: Project) =>
  (ids: readonly SegmentId[], reason: string): Project => ({
    ...project,
    entries: ids.reduce((entries, id) => new Map(entries).set(id, asFailed(reason)), project.entries),
  })
