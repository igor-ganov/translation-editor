import { Option } from 'effect'
import type { Route } from '../../../ui/store/app-state.js'
import type { Deps } from '../deps.js'

/**
 * The way back from settings.
 *
 * Settings can be reached from the shelf or from a document's desk, and it used
 * to return to the shelf either way — so changing a setting mid-document cost
 * the reader their place. It now goes back to whatever there is to go back to.
 */
export const handleBack =
  (deps: Deps) =>
  (): void => {
    deps.store.update((state) => ({
      ...state,
      route: Option.match(state.project, {
        onNone: (): Route => 'projects',
        onSome: (): Route => 'editor',
      }),
    }))
  }
