import { describe, expect, it } from 'vitest'
import { appendEntry } from './append-entry.js'
import { formatEntry } from './format-entry.js'
import { formatLog } from './format-log.js'
import { logLimit } from './log-limit.js'
import type { LogContext, LogEntry } from './types.js'

const entry = (message: string, at = 0): LogEntry => ({
  at,
  level: 'info',
  scope: 'test',
  message,
  detail: undefined,
})

const context: LogContext = {
  version: '0.1.0',
  platform: 'tauri',
  userAgent: 'Android 14',
  provider: 'anthropic',
  model: 'claude-opus-5',
  languages: 'it>ru',
  project: 'sample.docx',
}

describe('appendEntry', () => {
  it('keeps entries in the order they happened', () => {
    const log = appendEntry(appendEntry([])(entry('first')))(entry('second'))
    expect(log.map((item) => item.message)).toStrictEqual(['first', 'second'])
  })

  it('drops the oldest once the bound is reached, keeping the tail', () => {
    const filled = Array.from({ length: logLimit + 20 }, (_unused, index) => index).reduce<readonly LogEntry[]>(
      (log, index) => appendEntry(log)(entry(`e${String(index)}`)),
      [],
    )
    expect(filled).toHaveLength(logLimit)
    expect(filled.at(-1)?.message).toBe(`e${String(logLimit + 19)}`)
    expect(filled[0]?.message).toBe('e20')
  })
})

describe('formatEntry', () => {
  it('renders a timestamp, level, scope and message', () => {
    expect(formatEntry(entry('something happened', Date.UTC(2026, 0, 1, 12, 30, 45, 123)))).toBe(
      '12:30:45.123 INFO  test       something happened',
    )
  })

  it('indents structured detail underneath, so it stays readable', () => {
    const withDetail: LogEntry = { ...entry('failed'), level: 'error', detail: 'line one\nline two' }
    expect(formatEntry(withDetail)).toContain('\n    line one\n    line two')
  })
})

describe('formatLog', () => {
  it('leads with the facts that would otherwise have to be asked for', () => {
    const text = formatLog(context)([entry('started')])
    expect(text).toContain('version   0.1.0')
    expect(text).toContain('platform  tauri')
    expect(text).toContain('provider  anthropic / claude-opus-5')
    expect(text).toContain('languages it>ru')
  })

  it('includes every entry', () => {
    const text = formatLog(context)([entry('one'), entry('two')])
    expect(text).toContain('one')
    expect(text).toContain('two')
  })

  it('produces something usable even with no entries at all', () => {
    expect(formatLog(context)([])).toContain('# Translation Editor diagnostic log')
  })
})
