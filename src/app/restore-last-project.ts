import { Effect, Option, pipe } from 'effect'
import type { ProjectId } from '../core/document/types.js'
import { fromUndefined } from '../core/option/from-undefined.js'
import type { AppState } from '../ui/store/app-state.js'
import { openedAt } from './controller/opened-at.js'
import { persistProject } from './controller/persist-project.js'
import type { Deps } from './controller/deps.js'

const load = (deps: Deps) => (id: ProjectId) =>
  Effect.orElseSucceed(deps.platform.storage.loadProject(id), () => Option.none())

/**
 * Reopens the document the user was last in, so relaunching lands them back in
 * the editor rather than on the list. A document that has since been deleted
 * simply leaves them on the list.
 */
export const restoreLastProject = (deps: Deps): Effect.Effect<void> =>
  // Suspended so the stored id is read when this runs, not when the surrounding
  // pipeline is assembled — settings are still loading at that point.
  Effect.suspend(() =>
    pipe(
      fromUndefined(deps.store.get().settings.lastProjectId),
      Option.match({
        onNone: () => Effect.void,
        onSome: (id) =>
          Effect.map(load(deps)(id), (loaded) => {
            deps.store.update((state) => {
              const opened: AppState = {
                ...state,
                project: loaded,
                route: Option.match(loaded, { onNone: () => state.route, onSome: () => 'editor' as const }),
              }
              return { ...opened, page: openedAt(opened) }
            })
            for (const project of Option.toArray(loaded)) persistProject(deps)(project)
          }),
      }),
    ),
  )
