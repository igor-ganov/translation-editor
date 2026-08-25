import { appendEntry } from '../core/log/append-entry.js'
import { formatEntry } from '../core/log/format-entry.js'
import type { LogEntry, LogLevel } from '../core/log/types.js'

export type Logger = {
  readonly record: (level: LogLevel, scope: string, message: string, detail?: unknown) => void
  readonly entries: () => readonly LogEntry[]
  readonly clear: () => void
}

const describe = (detail: unknown): string | undefined => {
  switch (typeof detail) {
    case 'undefined':
      return undefined
    case 'string':
      return detail
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'symbol':
    case 'function':
      return String(detail)
    case 'object':
      return JSON.stringify(detail, undefined, 2)
  }
}

/**
 * An in-memory diagnostic log that also prints.
 *
 * Printing matters as much as keeping: inside an Android WebView, `console`
 * output is forwarded into logcat, which makes `adb logcat` a live view of a
 * device that has no developer tooling attached — and gives CI something
 * dependable to wait for, since the accessibility tree cannot see into the
 * shadow roots this interface is built from.
 */
export const createLogger = (): Logger => {
  let entries: readonly LogEntry[] = []
  return {
    record: (level, scope, message, detail) => {
      const entry: LogEntry = { at: Date.now(), level, scope, message, detail: describe(detail) }
      entries = appendEntry(entries)(entry)
      globalThis.console.info(`[te] ${formatEntry(entry)}`)
    },
    entries: () => entries,
    clear: () => {
      entries = []
    },
  }
}
