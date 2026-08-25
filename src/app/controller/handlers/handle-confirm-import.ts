import { Option } from 'effect'
import { setNotice } from '../set-notice.js'
import { updateProjectUndoable } from '../update-project-undoable.js'
import type { Deps } from '../deps.js'

/**
 * Applies the import the user just confirmed, then clears the pending summary.
 * The whole import undoes as one step.
 */
export const handleConfirmImport = (deps: Deps) => (): void => {
  for (const pending of Option.toArray(deps.store.get().pendingImport)) {
    updateProjectUndoable(deps)('import translations')(() => pending.apply())
    setNotice(deps)({
      tag: 'info',
      text: `Imported ${String(pending.diff.added.length + pending.diff.changed.length)} translations.`,
    })
  }
  deps.store.update((state) => ({ ...state, pendingImport: Option.none() }))
}
