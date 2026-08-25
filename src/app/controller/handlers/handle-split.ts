import { splitSentence } from '../../../core/boundaries/split-sentence.js'
import type { BoundaryDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProjectUndoable } from '../update-project-undoable.js'

/**
 * Splits a sentence at the caret. The offset arrives relative to the sentence
 * and is shifted onto the block's text, which is what the boundaries work in.
 */
export const handleSplit =
  (deps: Deps) =>
  (detail: BoundaryDetail): void => {
    updateProjectUndoable(deps)('split sentence')((project) =>
      splitSentence(project)(detail.id)(detail.offset),
    )
  }
