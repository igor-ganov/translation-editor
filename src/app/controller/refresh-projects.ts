import { Effect } from 'effect'
import type { Deps } from './deps.js'

/** Reloads the project list after anything that could have changed it. */
export const refreshProjects = (deps: Deps): Effect.Effect<void> =>
  Effect.map(
    Effect.orElseSucceed(deps.platform.storage.listProjects(), () => []),
    (projects) => {
      deps.store.update((state) => ({ ...state, projects }))
    },
  )
