import { Option } from 'effect'
import type { Entry } from '../project/types.js'
import { translationText } from '../translation/translation-text.js'
import type { SegmentFilter } from './types.js'

const PREDICATES: Record<SegmentFilter, (entry: Entry) => boolean> = {
  all: () => true,
  untranslated: (entry) => Option.isNone(translationText(entry.translation)),
  unapproved: (entry) => !entry.approved,
  failed: (entry) => entry.translation.tag === 'failed',
}

/** Whether a segment survives the current view filter. */
export const matchesFilter =
  (filter: SegmentFilter) =>
  (entry: Entry): boolean =>
    PREDICATES[filter](entry)
