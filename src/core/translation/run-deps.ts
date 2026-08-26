import type { Effect } from 'effect'
import type { Project } from '../project/types.js'
import type { TranslationProvider } from '../../ports/provider-port.js'

export type RunDeps = {
  readonly provider: TranslationProvider
  readonly budgetTokens: number
  /** Called after every batch is stored, so the UI and the database stay current. */
  readonly onBatchDone: (project: Project, done: number, total: number) => Effect.Effect<void>
  /**
   * Called with the service's own words when a batch is rejected whole.
   *
   * Without this a run could fail every segment it had and leave nothing behind
   * saying why, which is exactly how a `max_tokens` rejection went unnoticed
   * through two releases.
   */
  readonly onBatchFailed: (reason: string, count: number) => Effect.Effect<void>
}
