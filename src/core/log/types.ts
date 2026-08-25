export type LogLevel = 'info' | 'warn' | 'error'

export type LogEntry = {
  readonly at: number
  readonly level: LogLevel
  /** Where it came from — "import", "translate", "storage", "provider". */
  readonly scope: string
  readonly message: string
  /** Anything structured worth keeping, already stringified. */
  readonly detail: string | undefined
}

/**
 * Facts about the running app, recorded once at the top of an exported log.
 * These are the questions that otherwise have to be asked over chat.
 */
export type LogContext = {
  readonly version: string
  readonly platform: string
  readonly userAgent: string
  readonly provider: string
  readonly model: string
  readonly languages: string
  readonly project: string
}
