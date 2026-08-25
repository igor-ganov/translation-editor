import { Effect, Option } from 'effect'
import type { Project } from '../../core/project/types.js'
import type { Deps } from './deps.js'

/**
 * Applies a pure change to the open project, publishes it, and persists it.
 *
 * Every mutation goes through here, which is what makes "the user never presses
 * save" true without scattering write calls through the UI.
 */
export const updateProject =
  (deps: Deps) =>
  (change: (project: Project) => Project): void => {
    deps.store.update((state) => ({
      ...state,
      project: Option.map(state.project, (project) => ({
        ...change(project),
        updatedAt: Date.now(),
      })),
    }))
    for (const project of Option.toArray(deps.store.get().project)) {
      void Effect.runPromise(Effect.ignore(deps.platform.storage.saveProject(project)))
    }
  }
