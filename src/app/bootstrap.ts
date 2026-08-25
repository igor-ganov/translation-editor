import { Effect, Option, pipe } from 'effect'
import { createPlatform } from './create-platform.js'
import { createStore } from '../ui/store/create-store.js'
import type { Store } from '../ui/store/create-store.js'
import type { AppState } from '../ui/store/app-state.js'
import { initialState } from './initial-state.js'
import { refreshProjects } from './controller/refresh-projects.js'
import { restoreLastProject } from './restore-last-project.js'
import type { Deps } from './controller/deps.js'

/**
 * Builds the application: choose the platform adapters, load stored settings and
 * the document list, and hand back the store the shell renders from.
 */
export const bootstrap = async (): Promise<Deps> => {
  const platform = await createPlatform()
  const store: Store<AppState> = createStore({
    ...initialState,
    secureCredentials: platform.settings.secureCredentials,
  })
  const deps: Deps = { platform, store }
  await Effect.runPromise(
    pipe(
      platform.settings.load(),
      Effect.map((loaded) => {
        store.update((state) => ({
          ...state,
          settings: Option.getOrElse(loaded, () => state.settings),
        }))
      }),
      Effect.andThen(refreshProjects(deps)),
      Effect.andThen(restoreLastProject(deps)),
    ),
  )
  return deps
}
