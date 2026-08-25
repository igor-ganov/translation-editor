import { Option, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { withEntry } from '../project/with-entry.js'
import { canApprove } from './can-approve.js'

/** Clearing approval is always allowed; granting it requires a usable translation. */
const allowed = (project: Project) => (id: SegmentId) => (approved: boolean): boolean =>
  !approved || canApprove(project)(id)

/**
 * Sets one segment's approval. A request that would approve an untranslated
 * segment is a no-op rather than an error, so bulk cascades need no filtering.
 */
export const setSegmentApproval =
  (project: Project) =>
  (id: SegmentId) =>
  (approved: boolean): Project =>
    pipe(
      lookupEntry(project.entries)(id),
      Option.filter(() => allowed(project)(id)(approved)),
      Option.map((entry) => withEntry(project)(id)({ ...entry, approved })),
      Option.getOrElse(() => project),
    )
