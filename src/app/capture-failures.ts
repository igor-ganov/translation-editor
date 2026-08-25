import { Option, pipe } from 'effect'
import type { Logger } from './create-logger.js'

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
    logger.record('error', 'uncaught', event.message, {
      source: `${event.filename}:${String(event.lineno)}:${String(event.colno)}`,
      stack: stackOf(event.error),
    })
  })
  globalThis.addEventListener('unhandledrejection', (event) => {
    logger.record('error', 'unhandled', 'a promise rejected with no handler', String(event.reason))
  })
}
