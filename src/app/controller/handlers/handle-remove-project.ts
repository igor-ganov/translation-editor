import { Effect, pipe } from 'effect'
import type { ProjectId } from '../../../core/document/types.js'
import type { Deps } from '../deps.js'
import { refreshProjects } from '../refresh-projects.js'

/** Deletes a document and everything stored with it. */
export const handleRemoveProject =
  (deps: Deps) =>
  (detail: { readonly id: ProjectId }): void => {
    void Effect.runPromise(
      pipe(
        Effect.ignore(deps.platform.storage.deleteProject(detail.id)),
        Effect.andThen(refreshProjects(deps)),
      ),
    )
  }
