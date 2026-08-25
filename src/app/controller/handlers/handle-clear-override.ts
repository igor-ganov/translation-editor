import type { Project } from '../../../core/project/types.js'
import type { BlockToggleDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProject } from '../update-project.js'

/**
 * Removes the paragraph-level translation. The sentence translations were never
 * deleted while it was in force, so they simply come back into effect.
 */
export const handleClearOverride =
  (deps: Deps) =>
  (detail: BlockToggleDetail): void => {
    updateProject(deps)(
      (project): Project => ({
        ...project,
        entries: new Map([...project.entries].filter(([key]) => key !== detail.id)),
      }),
    )
  }
