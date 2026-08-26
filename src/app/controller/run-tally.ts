import { Effect } from 'effect'
import { commonReason } from '../../core/translation/common-reason.js'
import type { TranslationOutcome } from '../../core/translation/translation-outcome.js'

export type RunTally = {
  readonly record: (reason: string, count: number) => Effect.Effect<void>
  readonly outcome: (attempted: number) => TranslationOutcome
}

/**
 * What this run did, rather than what the document happens to contain.
 *
 * Counting the finished project instead reported the totals: a run that
 * translated nothing and rejected forty-four sentences still announced
 * "Translated 73", because seventy-three translations were already there from
 * an earlier run. The number a person reads after pressing a button has to be
 * about the thing they just pressed.
 */
export const runTally = (onFailure: (reason: string, count: number) => void): RunTally => {
  const reasons: string[] = []
  return {
    record: (reason, count) =>
      Effect.sync(() => {
        onFailure(reason, count)
        reasons.push(...Array.from({ length: count }, () => reason))
      }),
    outcome: (attempted) => ({
      failed: reasons.length,
      translated: Math.max(0, attempted - reasons.length),
      reason: commonReason(reasons),
    }),
  }
}
