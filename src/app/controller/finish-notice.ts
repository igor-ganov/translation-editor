import { Option, pipe } from 'effect'
import type { Notice } from '../../ui/store/app-state.js'
import type { TranslationOutcome } from '../../core/translation/translation-outcome.js'
import { plural } from './plural.js'

const partly = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Translated ${String(outcome.translated)}, but ${plural(outcome.failed, 'segment', 'segments')} failed. Filter to "Failed" to retry them.`,
})

const nothing = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Nothing was translated — all ${plural(outcome.failed, 'segment', 'segments')} failed. Check the provider settings.`,
})

const clean = (outcome: TranslationOutcome): Notice => ({
  tag: 'info',
  text: `Translated ${plural(outcome.translated, 'segment', 'segments')}.`,
})

/** A run in which nothing succeeded is a failure, however quietly it ended. */
export const finishNotice = (outcome: TranslationOutcome): Notice =>
  pipe(
    Option.liftPredicate((result: TranslationOutcome) => result.failed > 0)(outcome),
    Option.map((failedRun) =>
      pipe(
        Option.liftPredicate((result: TranslationOutcome) => result.translated > 0)(failedRun),
        Option.map(partly),
        Option.getOrElse(() => nothing(failedRun)),
      ),
    ),
    Option.getOrElse(() => clean(outcome)),
  )
