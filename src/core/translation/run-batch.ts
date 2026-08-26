import { Effect, pipe } from 'effect'
import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'
import type { RunDeps } from './run-deps.js'
import { applyBatch } from './apply-batch.js'
import { markBatchFailed } from './mark-batch-failed.js'
import { failureReason } from './failure-reason.js'
import { translateOnce } from './translate-once.js'
import { idsOf } from './ids-of.js'

type State = { readonly project: Project; readonly done: number }

const recordFailure = (deps: RunDeps) => (state: State, batch: Batch) => (reason: string) =>
  Effect.as(
    deps.onBatchFailed(reason, batch.sentences.length),
    markBatchFailed(state.project)(idsOf(batch), reason),
  )

/** One batch through the service and into the project, whether it lands or not. */
export const runBatch = (deps: RunDeps) => (total: number) => (state: State, batch: Batch) =>
  pipe(
    translateOnce(deps)(state.project)(batch),
    Effect.map((results) => applyBatch(state.project)(results)),
    Effect.catchAll((failure) => recordFailure(deps)(state, batch)(failureReason(failure))),
    Effect.tap((project) => deps.onBatchDone(project, state.done + batch.sentences.length, total)),
    Effect.map((project) => ({ project, done: state.done + batch.sentences.length })),
  )
