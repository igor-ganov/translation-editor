import { Effect, pipe } from 'effect'
import type { Project } from '../project/types.js'
import type { Batch } from './plan-batches.js'
import type { RunDeps } from './run-deps.js'
import { batchContext } from './batch-context.js'
import { reconcileBatch } from './reconcile-batch.js'
import { retryPolicy } from './retry-policy.js'
import { idsOf } from './ids-of.js'

/** One batch, sent and checked back against the ids that were asked for. */
export const translateOnce = (deps: RunDeps) => (project: Project) => (batch: Batch) =>
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
