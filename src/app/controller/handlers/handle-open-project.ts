import { Effect, Option, pipe } from 'effect'
import type { ProjectId } from '../../../core/document/types.js'
import type { Deps } from '../deps.js'
import { setNotice } from '../set-notice.js'
import { rememberProject } from '../remember-project.js'

/** Opens a stored project, restoring the position the user was last at. */
export const handleOpenProject =
  (deps: Deps) =>
  (detail: { readonly id: ProjectId }): void => {
    void Effect.runPromise(
      pipe(
        deps.platform.storage.loadProject(detail.id),
        Effect.map((loaded) => {
          rememberProject(deps)(Option.match(loaded, { onNone: () => undefined, onSome: (p) => p.id }))
          deps.store.update((state) => ({
            ...state,
            project: loaded,
            // A project that failed to load leaves the user on the list rather
            // than dropping them into an empty editor.
            route: Option.match(loaded, { onNone: () => state.route, onSome: () => 'editor' as const }),
            collapsed: new Set(),
          }))
        }),
        Effect.catchAll((failure) =>
          Effect.sync(() => {
            setNotice(deps)({ tag: 'error', text: `Could not open that document: ${failure.message}` })
          }),
        ),
      ),
    )
  }
