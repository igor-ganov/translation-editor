import { html } from 'lit'
import type { Progress } from '../../core/approval/project-progress.js'

const percent = (ratio: number): string => `${String(Math.round(ratio * 100))}%`

/**
 * Approval progress with translation coverage behind it, so the user can see both
 * how much exists and how much has actually been checked.
 */
export const renderProgress = (progress: Progress) => html`
  <div
    class="progress"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow=${String(Math.round(progress.approvedRatio * 100))}
    aria-label="Approved segments"
  >
    <div class="coverage" style=${`width:${percent(progress.coverageRatio)}`}></div>
    <div class="approved" style=${`width:${percent(progress.approvedRatio)}`}></div>
  </div>
  <p class="counts">
    ${String(progress.approved)} of ${String(progress.total)} approved
    <span class="muted">· ${String(progress.translated)} translated</span>
  </p>
`
