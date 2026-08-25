import { mergeWithNext } from '../../../core/boundaries/merge-with-next.js'
import type { BlockToggleDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProjectUndoable } from '../update-project-undoable.js'

/** Fixes a sentence the segmenter split at an abbreviation. Reversible. */
export const handleMergeNext =
  (deps: Deps) =>
  (detail: BlockToggleDetail): void => {
    updateProjectUndoable(deps)('merge sentences')((project) => mergeWithNext(project)(detail.id))
  }
