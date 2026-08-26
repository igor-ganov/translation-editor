import { Match, Option, pipe } from 'effect'
import type { BatchFailure } from './batch-failure.js'

const statusSuffix = (status: number | undefined): string =>
  pipe(
    Option.fromNullable(status),
    Option.map((code) => ` (${String(code)})`),
    Option.getOrElse(() => ''),
  )

const mismatch = (missing: readonly string[], unexpected: readonly string[]): string =>
  `The reply did not match what was asked for: ${String(missing.length)} sentence(s) missing`
  + `, ${String(unexpected.length)} unasked for. First missing: ${missing.slice(0, 3).join(', ')}`

/**
 * A batch failure in words a reader can act on.
 *
 * `JSON.stringify` stood here, which printed a tagged union and left the
 * service's own sentence — the only part that says what went wrong — behind two
 * levels of quoting. Worse, nothing wrote it to the log at all, so a run could
 * fail every segment it had and the record showed only that it had.
 */
export const failureReason: (failure: BatchFailure) => string = Match.type<BatchFailure>().pipe(
  Match.when({ tag: 'transient' }, (failure) =>
    `Could not reach the service${statusSuffix(failure.status)}. ${failure.message}`),
  Match.when({ tag: 'auth' }, (failure) => failure.message),
  // No prefix: the service's own sentence says it was refused, and everything
  // that shows this already marks it as a failure.
  Match.when({ tag: 'badRequest' }, (failure) => failure.message),
  Match.when({ tag: 'malformedResponse' }, (failure) => `The reply could not be read. ${failure.message}`),
  Match.when({ tag: 'idMismatch' }, (failure) => mismatch(failure.missing, failure.unexpected)),
  Match.exhaustive,
)
