import { Effect, Option } from 'effect'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/** Restores the snapshot taken before the last reversible operation. */
export const handleUndo = (deps: Deps) => (): void => {
  for (const entry of Option.toArray(Option.fromIterable(deps.store.get().undo))) {
    deps.store.update((state) => ({
      ...state,
      project: Option.some(entry.project),
      undo: state.undo.slice(1),
    }))
    void Effect.runPromise(Effect.ignore(deps.platform.storage.saveProject(entry.project)))
    setNotice(deps)({ tag: 'info', text: `Undid: ${entry.label}.` })
  }
}
