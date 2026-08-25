import type { Busy } from '../../ui/store/app-state.js'
import type { Deps } from './deps.js'

/** Publishes what the app is doing, so the header can show progress or a cancel. */
export const setBusy =
  (deps: Deps) =>
  (busy: Busy): void => {
    deps.store.update((state) => ({ ...state, busy }))
  }
