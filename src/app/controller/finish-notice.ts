import { Option, pipe } from 'effect'
import type { Notice } from '../../ui/store/app-state.js'
import type { TranslationOutcome } from '../../core/translation/translation-outcome.js'
import { plural } from './plural.js'

const partly = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Translated ${String(outcome.translated)}, but ${plural(outcome.failed, 'sentence', 'sentences')} failed. Each failed sentence says why beside it; the "Went wrong" filter on the desk collects them.`,
})

const nothing = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Nothing was translated. All ${plural(outcome.failed, 'sentence', 'sentences')} failed, and each one says why beside it.`,
})

const clean = (outcome: TranslationOutcome): Notice => ({
  tag: 'info',
  text: `Translated ${plural(outcome.translated, 'sentence', 'sentences')}.`,
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
