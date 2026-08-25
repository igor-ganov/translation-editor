import { Option, pipe } from 'effect'
import { fromUndefined } from '../option/from-undefined.js'
import type { LogEntry } from './types.js'

const stamp = (at: number): string => new Date(at).toISOString().slice(11, 23)

const suffix = (detail: string | undefined): string =>
  pipe(
    fromUndefined(detail),
    Option.map((text) => `\n    ${text.replace(/\n/g, '\n    ')}`),
    Option.getOrElse(() => ''),
  )

/** One line per entry, with any structured detail indented under it. */
export const formatEntry = (entry: LogEntry): string =>
  `${stamp(entry.at)} ${entry.level.toUpperCase().padEnd(5)} ${entry.scope.padEnd(10)} ${entry.message}${suffix(entry.detail)}`
