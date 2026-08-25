import { Effect, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import type { TranslationProvider } from '../../ports/provider-port.js'
import { selectUntranslated } from './select-untranslated.js'
import { planBatches } from './plan-batches.js'
import type { Batch } from './plan-batches.js'
import { batchContext } from './batch-context.js'
import { reconcileBatch } from './reconcile-batch.js'
import { applyBatch } from './apply-batch.js'
import { markBatchFailed } from './mark-batch-failed.js'
import { retryPolicy } from './retry-policy.js'

export type RunDeps = {
  readonly provider: TranslationProvider
  readonly budgetTokens: number
  /** Called after every batch is stored, so the UI and the database stay current. */
  readonly onBatchDone: (project: Project, done: number, total: number) => Effect.Effect<void>
}

const idsOf = (batch: Batch): readonly SegmentId[] => batch.sentences.map((sentence) => sentence.id)

const translateOnce = (deps: RunDeps) => (project: Project) => (batch: Batch) =>
  pipe(
    deps.provider.translate({
      segments: batch.sentences.map((sentence) => ({ id: sentence.id, text: sentence.text })),
      from: project.languages.from,
      to: project.languages.to,
      context: batchContext(project)(batch),
    }),
    Effect.retry(retryPolicy),
    Effect.flatMap((returned) => reconcileBatch(idsOf(batch))(returned)),
  )

const runBatch = (deps: RunDeps) => (total: number) =>
  (state: { readonly project: Project; readonly done: number }, batch: Batch) =>
    pipe(
      translateOnce(deps)(state.project)(batch),
      Effect.map((results) => applyBatch(state.project)(results)),
      Effect.catchAll((failure) =>
        Effect.succeed(markBatchFailed(state.project)(idsOf(batch), JSON.stringify(failure))),
      ),
      Effect.tap((project) => deps.onBatchDone(project, state.done + batch.sentences.length, total)),
      Effect.map((project) => ({ project, done: state.done + batch.sentences.length })),
    )

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
