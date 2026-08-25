import { Effect, Option } from 'effect'
import type { SegmentId } from '../../../core/document/types.js'
import type { Deps } from '../deps.js'

/**
 * Remembers where the user is. Written on its own rather than through the whole
 * project, because it happens while scrolling and must stay cheap.
 */
export const handleCursorMove =
  (deps: Deps) =>
  (detail: { readonly id: SegmentId }): void => {
    deps.store.update((state) => ({
      ...state,
      project: Option.map(state.project, (project) => ({ ...project, cursor: detail.id })),
    }))
    for (const project of Option.toArray(deps.store.get().project)) {
      void Effect.runPromise(Effect.ignore(deps.platform.storage.saveCursor(project.id)(detail.id)))
    }
  }
