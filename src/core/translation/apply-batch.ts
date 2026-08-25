import type { SegmentId } from '../document/types.js'
import type { Entry, Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { Option, pipe } from 'effect'

const asMachine = (text: string): Entry => ({ translation: { tag: 'machine', text }, approved: false })

/** A segment the user has since edited or approved keeps what it has. */
const isProtected = (project: Project) => (id: SegmentId): boolean =>
  pipe(
    lookupEntry(project.entries)(id),
    Option.map((entry) => entry.approved || entry.translation.tag === 'edited'),
    Option.getOrElse(() => false),
  )

/**
 * Stores one batch of machine translations. Written as a whole-batch operation so
 * the caller can persist immediately after it: a cancelled or killed run then
 * costs at most the batch in flight.
 */
export const applyBatch =
  (project: Project) =>
  (results: ReadonlyMap<SegmentId, string>): Project => ({
    ...project,
    entries: [...results].reduce(
      (entries, [id, text]) =>
        pipe(
          Option.liftPredicate((candidate: SegmentId) => !isProtected(project)(candidate))(id),
          Option.map((candidate) => new Map(entries).set(candidate, asMachine(text))),
          Option.getOrElse(() => entries),
        ),
      project.entries,
    ),
  })
