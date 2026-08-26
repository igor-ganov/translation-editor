import { Option, pipe } from 'effect'
import type { Logger } from './create-logger.js'
import { benignFailure } from './benign-failure.js'

const stackOf = (cause: unknown): string | undefined =>
  pipe(
    Option.liftPredicate((value: unknown): value is Error => value instanceof Error)(cause),
    Option.map((error) => error.stack ?? error.message),
    Option.getOrUndefined,
  )

/**
 * Routes anything that escapes to the log.
 *
 * A thrown error inside a WebView on a phone leaves no trace a user can hand
 * over — the console is not reachable. Catching it here is what turns "it just
 * stopped working" into a line someone can read.
 */
export const captureFailures = (logger: Logger): void => {
  globalThis.addEventListener('error', (event) => {
    pipe(
      Option.liftPredicate((failure: ErrorEvent) => !benignFailure(failure.message))(event),
      Option.map((failure) => {
        logger.record('error', 'uncaught', failure.message, {
          source: `${failure.filename}:${String(failure.lineno)}:${String(failure.colno)}`,
          stack: stackOf(failure.error),
        })
      }),
    )
  })
  globalThis.addEventListener('unhandledrejection', (event) => {
    logger.record('error', 'unhandled', 'a promise rejected with no handler', String(event.reason))
  })
}
