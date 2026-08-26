import { html } from 'lit'
import type { Progress } from '../../core/approval/project-progress.js'

const percent = (ratio: number): string => `${String(Math.round(ratio * 100))}%`

/**
 * Progress as a thread rather than a bar in a box.
 *
 * The count beside it says the same thing in words, so neither line carries
 * anything on its own — and "settled" is the word the rest of the interface
 * uses, rather than a second name for the same state.
 */
export const renderThread = (progress: Progress) => html`
  <p
    class="thread"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow=${String(Math.round(progress.approvedRatio * 100))}
    aria-label="Settled segments"
  >
    <span class="thread__track">
      <span class="thread__drafted" style=${`width:${percent(progress.coverageRatio)}`}></span>
      <span class="thread__done" style=${`width:${percent(progress.approvedRatio)}`}></span>
    </span>
    <span class="thread__count">
      ${String(progress.approved)} of ${String(progress.total)} settled ·
      ${String(progress.translated)} drafted
    </span>
  </p>
`
