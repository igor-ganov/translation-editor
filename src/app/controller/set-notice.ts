import type { Notice } from '../../ui/store/app-state.js'
import type { Deps } from './deps.js'

/** Publishes a message for the shell to show. */
export const setNotice =
  (deps: Deps) =>
  (notice: Notice): void => {
    deps.store.update((state) => ({ ...state, notice }))
  }
