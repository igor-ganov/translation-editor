import { handleImportDocx } from './handlers/handle-import-docx.js'
import { handleOpenProject } from './handlers/handle-open-project.js'
import { handleRemoveProject } from './handlers/handle-remove-project.js'
import { handleSaveSettings } from './handlers/handle-save-settings.js'
import { handleTestProvider } from './handlers/handle-test-provider.js'
import { handleRoute } from './handlers/handle-route.js'
import type { Deps } from './deps.js'

/** Events raised by the project list and the settings screen. */
export const attachProjectListeners =
  (deps: Deps) =>
  (host: HTMLElement): void => {
    host.addEventListener('te-import-docx', handleImportDocx(deps))
    host.addEventListener('te-open-project', (event) => {
      handleOpenProject(deps)(event.detail)
    })
    host.addEventListener('te-remove-project', (event) => {
      handleRemoveProject(deps)(event.detail)
    })
    host.addEventListener('te-save-settings', (event) => {
      handleSaveSettings(deps)(event.detail)
    })
    host.addEventListener('te-test-provider', handleTestProvider(deps))
    host.addEventListener('te-open-settings', handleRoute(deps)('settings'))
    host.addEventListener('te-back', handleRoute(deps)('projects'))
  }
