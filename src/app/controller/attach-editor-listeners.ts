import { handleFilterChange } from './handlers/handle-filter-change.js'
import { handleCursorMove } from './handlers/handle-cursor-move.js'
import { handleTranslate } from './handlers/handle-translate.js'
import { handleCancelTranslate } from './handlers/handle-cancel-translate.js'
import { handleExportDocx } from './handlers/handle-export-docx.js'
import { handleExportMarkup } from './handlers/handle-export-markup.js'
import { handleImportMarkup } from './handlers/handle-import-markup.js'
import { handleConfirmImport } from './handlers/handle-confirm-import.js'
import { handleCancelImport } from './handlers/handle-cancel-import.js'
import { handleNextUnapproved } from './handlers/handle-next-unapproved.js'
import { handleUndo } from './handlers/handle-undo.js'
import { handleExportLog } from './handlers/handle-export-log.js'
import { handleDismissNotice } from './handlers/handle-dismiss-notice.js'
import { handleRoute } from './handlers/handle-route.js'
import { handleTurnPage } from './handlers/handle-turn-page.js'
import { handleGoToPage } from './handlers/handle-go-to-page.js'
import { handleSetLanguages } from './handlers/handle-set-languages.js'
import type { Deps } from './deps.js'

/** Events raised by the editor header and the import confirmation. */
export const attachEditorListeners =
  (deps: Deps) =>
  (host: HTMLElement): void => {
    host.addEventListener('te-filter-change', (event) => {
      handleFilterChange(deps)(event.detail)
    })
    host.addEventListener('te-cursor-move', (event) => {
      handleCursorMove(deps)(event.detail)
    })
    host.addEventListener('te-translate', handleTranslate(deps))
    host.addEventListener('te-cancel-translate', handleCancelTranslate(deps))
    host.addEventListener('te-export-docx', handleExportDocx(deps))
    host.addEventListener('te-export-markup', handleExportMarkup(deps))
    host.addEventListener('te-import-markup', handleImportMarkup(deps))
    host.addEventListener('te-confirm-import', handleConfirmImport(deps))
    host.addEventListener('te-cancel-import', handleCancelImport(deps))
    host.addEventListener('te-next-unapproved', handleNextUnapproved(deps))
    host.addEventListener('te-undo', handleUndo(deps))
    host.addEventListener('te-export-log', handleExportLog(deps))
    host.addEventListener('te-dismiss-notice', handleDismissNotice(deps))
    host.addEventListener('te-close-project', handleRoute(deps)('projects'))
    host.addEventListener('te-open-desk', handleRoute(deps)('desk'))
    host.addEventListener('te-open-contents', handleRoute(deps)('contents'))
    host.addEventListener('te-open-page', handleRoute(deps)('editor'))
    host.addEventListener('te-turn-page', (event) => {
      handleTurnPage(deps)(event.detail)
    })
    host.addEventListener('te-go-to-page', (event) => {
      handleGoToPage(deps)(event.detail)
    })
    host.addEventListener('te-set-languages', (event) => {
      handleSetLanguages(deps)(event.detail)
    })
  }
