import { Option } from 'effect'
import type { Project } from '../../core/project/types.js'
import { pushUndo } from '../../core/undo/push-undo.js'
import { updateProject } from './update-project.js'
import type { Deps } from './deps.js'

/**
 * A change the user can reverse as one step: applying an import, merging or
 * splitting a sentence. The snapshot is taken before the change, so undo is a
 * plain restore rather than a set of inverse operations to keep in sync.
 */
export const updateProjectUndoable =
  (deps: Deps) =>
  (label: string) =>
  (change: (project: Project) => Project): void => {
    for (const before of Option.toArray(deps.store.get().project)) {
      deps.store.update((state) => ({ ...state, undo: pushUndo(state.undo)({ label, project: before }) }))
    }
    updateProject(deps)(change)
  }
