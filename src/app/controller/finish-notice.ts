import { Option, pipe } from 'effect'
import type { Notice } from '../../ui/store/app-state.js'
import type { TranslationOutcome } from '../../core/translation/translation-outcome.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { plural } from './plural.js'

/** The service's own sentence, which is the first thing anyone wants to read. */
const because = (reason: string | undefined): string =>
  pipe(
    fromUndefined(reason),
    Option.map((text) => ` The service said: ${text}`),
    Option.getOrElse(() => ''),
  )

const partly = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Translated ${String(outcome.translated)}, but ${plural(outcome.failed, 'sentence', 'sentences')} failed.${because(outcome.reason)} The "Failed" filter on the desk collects them.`,
})

const nothing = (outcome: TranslationOutcome): Notice => ({
  tag: 'error',
  text: `Nothing was translated. All ${plural(outcome.failed, 'sentence', 'sentences')} failed.${because(outcome.reason)}`,
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
