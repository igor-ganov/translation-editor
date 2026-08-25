import { setSegmentApproval } from '../../../core/approval/set-segment-approval.js'
import type { ApproveDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'
import { updateProject } from '../update-project.js'

export const handleApprove =
  (deps: Deps) =>
  (detail: ApproveDetail): void => {
    updateProject(deps)((project) => setSegmentApproval(project)(detail.id)(detail.approved))
  }
