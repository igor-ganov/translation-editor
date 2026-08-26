import { html } from 'lit'
import type { Units } from '../../core/approval/block-units.js'
import { renderProjectsWords } from './render-projects-words.js'

/* An empty document is a thread at zero, not a division by zero. */
const width = (part: number, total: number): string =>
  `width:${String(Math.round((100 * part) / Math.max(total, 1)))}%`

/**
 * Progress as a thread rather than a bar in a box: the darker line is settled
 * work, the pale one behind it is drafted. The track is hidden from the reader
 * that cannot see it, because the count beside it says the same thing.
 */
export const renderProjectsThread = (units: Units) => html`
  <span class="thread">
    <span class="thread__track" aria-hidden="true">
      <span class="thread__drafted" style=${width(units.translated, units.total)}></span>
      <span class="thread__done" style=${width(units.approved, units.total)}></span>
    </span>
    <span class="thread__count">${renderProjectsWords(units)}</span>
  </span>
`
