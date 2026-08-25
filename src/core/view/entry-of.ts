import { Option, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Entry, Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'

const BLANK: Entry = { translation: { tag: 'absent' }, approved: false }

/** A segment with no stored entry reads as untranslated rather than as missing. */
export const entryOf =
  (project: Project) =>
  (id: SegmentId): Entry =>
    pipe(lookupEntry(project.entries)(id), Option.getOrElse(() => BLANK))
