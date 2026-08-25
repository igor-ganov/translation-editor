import type { Route } from '../../../ui/store/app-state.js'
import type { Deps } from '../deps.js'

/** Moves between the three screens. */
export const handleRoute =
  (deps: Deps) =>
  (route: Route) =>
  (): void => {
    deps.store.update((state) => ({ ...state, route }))
  }
