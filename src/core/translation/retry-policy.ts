import { Schedule } from 'effect'
import type { ProviderError } from '../../ports/provider-port.js'

const isTransient = (error: ProviderError): boolean => error.tag === 'transient'

/**
 * Four attempts with exponential backoff and jitter, and only for transient
 * failures. An auth or bad-request error fails the same way however often it is
 * sent, so retrying it only delays telling the user what is wrong.
 */
export const retryPolicy = Schedule.exponential('200 millis', 2).pipe(
  Schedule.jittered,
  // `intersect` keeps recurring only while both schedules agree, which is how the
  // attempt cap is applied on top of the growing delay.
  Schedule.intersect(Schedule.recurs(3)),
  Schedule.whileInput(isTransient),
)
