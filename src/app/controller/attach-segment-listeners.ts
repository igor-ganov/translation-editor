import { handleEdit } from './handlers/handle-edit.js'
import { handleApprove } from './handlers/handle-approve.js'
import { handleApproveBlock } from './handlers/handle-approve-block.js'
import { handleToggleCollapse } from './handlers/handle-toggle-collapse.js'
import { handleClearOverride } from './handlers/handle-clear-override.js'
import { handleMergeNext } from './handlers/handle-merge-next.js'
import { handleSplit } from './handlers/handle-split.js'
import type { Deps } from './deps.js'

/** Events raised by a segment row. Each detail is typed by the global event map. */
export const attachSegmentListeners =
  (deps: Deps) =>
  (host: HTMLElement): void => {
    host.addEventListener('te-edit', (event) => {
      handleEdit(deps)(event.detail)
    })
    host.addEventListener('te-approve', (event) => {
      handleApprove(deps)(event.detail)
    })
    host.addEventListener('te-approve-block', (event) => {
      handleApproveBlock(deps)(event.detail)
    })
    host.addEventListener('te-toggle-collapse', (event) => {
      handleToggleCollapse(deps)(event.detail)
    })
    host.addEventListener('te-clear-override', (event) => {
      handleClearOverride(deps)(event.detail)
    })
    host.addEventListener('te-merge-next', (event) => {
      handleMergeNext(deps)(event.detail)
    })
    host.addEventListener('te-split', (event) => {
      handleSplit(deps)(event.detail)
    })
  }
