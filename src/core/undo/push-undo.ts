import type { UndoEntry } from './types.js'
import { undoLimit } from './undo-limit.js'

/** Records a reversible operation, discarding the oldest once the bound is reached. */
export const pushUndo =
  (stack: readonly UndoEntry[]) =>
  (entry: UndoEntry): readonly UndoEntry[] =>
    [entry, ...stack].slice(0, undoLimit)
