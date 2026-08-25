import { Effect } from 'effect'
import type { ProjectId } from '../../core/document/types.js'
import type { Deps } from './deps.js'

/** Records which document to reopen next launch. */
export const rememberProject =
  (deps: Deps) =>
  (lastProjectId: ProjectId | undefined): void => {
    const settings = { ...deps.store.get().settings, lastProjectId }
    deps.store.update((state) => ({ ...state, settings }))
    void Effect.runPromise(deps.platform.settings.save(settings))
  }
