import type { LogEntry } from './types.js'
import { logLimit } from './log-limit.js'

/**
 * Adds an entry, dropping the oldest once the bound is reached.
 *
 * The newest entries are the ones that explain a failure, so the tail is what
 * survives — a log that stopped recording an hour before the problem is worse
 * than none, because it looks like evidence.
 */
export const appendEntry =
  (entries: readonly LogEntry[]) =>
  (entry: LogEntry): readonly LogEntry[] =>
    [...entries, entry].slice(-logLimit)
