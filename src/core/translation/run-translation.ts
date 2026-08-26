import { Effect } from 'effect'
import type { Project } from '../project/types.js'
import type { RunDeps } from './run-deps.js'
import { selectUntranslated } from './select-untranslated.js'
import { planBatches } from './plan-batches.js'
import { runBatch } from './run-batch.js'

/**
 * Translates everything still outstanding, one batch at a time.
 *
 * Each batch is stored the moment it lands, so interrupting the run — by the user
 * or by the operating system — never loses completed work, and the next run
 * recomputes what is outstanding and simply carries on.
 */
export const runTranslation =
  (deps: RunDeps) =>
  (project: Project): Effect.Effect<Project> => {
    const batches = planBatches(deps.budgetTokens)(selectUntranslated(project))
    const total = batches.reduce((count, batch) => count + batch.sentences.length, 0)
    return Effect.map(
      Effect.reduce(batches, { project, done: 0 }, runBatch(deps)(total)),
      (state) => state.project,
    )
  }
