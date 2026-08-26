import { Option, pipe } from 'effect'
import type { PageSummary } from '../core/view/page-summary.js'

type Rule = readonly [(summary: PageSummary) => boolean, (summary: PageSummary) => string]

/** First match wins, so the order is the meaning. */
const RULES: readonly Rule[] = [
  [(summary) => summary.total === 0, () => 'nothing to translate'],
  [(summary) => summary.approved === summary.total, () => 'finished'],
  [(summary) => summary.translated === 0, () => 'untouched'],
  [(summary) => summary.approved === 0, () => 'drafted, none settled'],
  [() => true, (summary) => `${String(summary.approved)} of ${String(summary.total)} settled`],
]

/**
 * What is left to do on a page, in words.
 *
 * The contents double as the progress view, which removes a screen that would
 * otherwise say the same thing somewhere else and drift out of step with it.
 */
export const pageStateWords = (summary: PageSummary): string =>
  pipe(
    Option.fromIterable(RULES.filter(([matches]) => matches(summary))),
    Option.map(([, say]) => say(summary)),
    Option.getOrElse(() => ''),
  )
