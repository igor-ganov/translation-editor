import { Effect, pipe } from 'effect'
import { formatLog } from '../../../core/log/format-log.js'
import { logContext } from '../../log-context.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/**
 * Writes the diagnostic log out as plain text.
 *
 * This is the only way a failure on someone else's phone becomes something that
 * can actually be read, rather than retyped from memory into a chat window.
 */
export const handleExportLog = (deps: Deps) => (): void => {
  const state = deps.store.get()
  const text = formatLog(logContext(state, deps.platform.native))(deps.logger.entries())
  void Effect.runPromise(
    pipe(
      deps.platform.file.save({
        suggestedName: `translation-editor-log-${String(Date.now())}.txt`,
        bytes: new TextEncoder().encode(text),
        mimeType: 'text/plain;charset=utf-8',
      }),
      Effect.map(() => {
        setNotice(deps)({ tag: 'info', text: `Log saved — ${String(deps.logger.entries().length)} entries.` })
      }),
      Effect.catchAll((failure) =>
        Effect.sync(() => {
          setNotice(deps)({ tag: 'error', text: `Could not save the log: ${failure.message}` })
        }),
      ),
    ),
  )
}
