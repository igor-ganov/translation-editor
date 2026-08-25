import { Effect, Option, pipe } from 'effect'
import { exportMarkupFile } from '../../actions/export-markup-file.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/**
 * Writes both sides of the segmented document: the source for an external
 * translator to work from, and the current translations to compare against.
 */
export const handleExportMarkup = (deps: Deps) => (): void => {
  for (const project of Option.toArray(deps.store.get().project)) {
    void Effect.runPromise(
      pipe(
        exportMarkupFile(deps.platform)(project)('source'),
        Effect.andThen(exportMarkupFile(deps.platform)(project)('translation')),
        Effect.map(() => {
          setNotice(deps)({ tag: 'info', text: 'Exported the source and translation markup files.' })
        }),
        Effect.catchAll((failure) =>
          Effect.sync(() => {
            setNotice(deps)({ tag: 'error', text: `Export failed: ${failure.message}` })
          }),
        ),
      ),
    )
  }
}
