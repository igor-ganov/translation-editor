import { Effect, Option, pipe } from 'effect'
import { exportReport } from '../../../core/export/export-report.js'
import { exportDocxFile } from '../../actions/export-docx-file.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/**
 * Writes the translated document. The count of paragraphs that will carry source
 * text is reported afterwards, so an incomplete export is never silent.
 */
export const handleExportDocx = (deps: Deps) => (): void => {
  for (const project of Option.toArray(deps.store.get().project)) {
    const report = exportReport(project)('all')
    void Effect.runPromise(
      pipe(
        exportDocxFile(deps.platform)(project)('all'),
        Effect.map(() => {
          setNotice(deps)({
            tag: 'info',
            text: `Exported ${String(report.translated)} of ${String(report.total)} paragraphs translated; ${String(report.fallback)} kept the source text.`,
          })
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
