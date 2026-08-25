import { applyEdit } from '../../../core/translation/apply-edit.js'
import type { EditDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProject } from '../update-project.js'

/** Stores a translation the user typed. Approval is cleared by `applyEdit` itself. */
export const handleEdit =
  (deps: Deps) =>
  (detail: EditDetail): void => {
    updateProject(deps)((project) => applyEdit(project)(detail.id)(detail.text))
  }
