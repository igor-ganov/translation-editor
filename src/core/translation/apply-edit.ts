import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { withEntry } from '../project/with-entry.js'

/**
 * Records a translation the user typed. Editing always clears approval, because an
 * approval means "I checked this text" and the text just changed. Doing both in one
 * function is what stops the two from drifting apart at any call site.
 */
export const applyEdit =
  (project: Project) =>
  (id: SegmentId) =>
  (text: string): Project =>
    withEntry(project)(id)({ translation: { tag: 'edited', text }, approved: false })
