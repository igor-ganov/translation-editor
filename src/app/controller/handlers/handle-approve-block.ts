import { setBlockApproval } from '../../../core/approval/set-block-approval.js'
import { blockIdOf } from '../../../core/document/block-id-of.js'
import type { ApproveDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProject } from '../update-project.js'

/** Approving a paragraph cascades to its sentences unless it overrides them. */
export const handleApproveBlock =
  (deps: Deps) =>
  (detail: ApproveDetail): void => {
    updateProject(deps)((project) => setBlockApproval(project)(blockIdOf(detail.id))(detail.approved))
  }
