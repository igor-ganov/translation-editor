import { html } from 'lit'
import type { TranslationState } from '../../core/project/types.js'
import { segmentStatus } from '../segment-status.js'
import { statusLabel } from '../status-label.js'

/**
 * The state badge. The icon is hidden from assistive technology and the words are
 * not, so the status reads correctly either way and never depends on colour.
 */
export const renderStatus = (id: string, translation: TranslationState, approved: boolean) => {
  const status = segmentStatus(translation, approved)
  const label = statusLabel[status]
  return html`
    <span class="status" id=${id} data-status=${status}>
      <span aria-hidden="true">${label.icon}</span>${label.text}
    </span>
  `
}
