import { Effect } from 'effect'
import type { Project } from '../../core/project/types.js'
import type { Deps } from './deps.js'

/**
 * Writes a project back without touching `updatedAt`.
 *
 * Used after loading, so a repair made on the way in — a document stored under a
 * content URI being given a readable name — reaches the shelf, which reads the
 * stored record rather than the open project. Opening a document is not editing
 * it, so the timestamp the shelf orders by is deliberately left alone.
 */
export const persistProject =
  (deps: Deps) =>
  (project: Project): void => {
    void Effect.runPromise(Effect.ignore(deps.platform.storage.saveProject(project)))
  }
