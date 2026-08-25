import type { LogContext, LogEntry } from './types.js'
import { formatEntry } from './format-entry.js'

const header = (context: LogContext): readonly string[] => [
  '# Translation Editor diagnostic log',
  `version   ${context.version}`,
  `platform  ${context.platform}`,
  `agent     ${context.userAgent}`,
  `provider  ${context.provider} / ${context.model}`,
  `languages ${context.languages}`,
  `document  ${context.project}`,
  '',
]

/**
 * The whole log as shareable text.
 *
 * The context block goes first because those are exactly the facts that
 * otherwise have to be prised out of a person over chat — which version, which
 * platform, which provider — and they are the ones that make the entries
 * underneath mean anything.
 */
export const formatLog =
  (context: LogContext) =>
  (entries: readonly LogEntry[]): string =>
    [...header(context), ...entries.map(formatEntry), ''].join('\n')
