import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { renderStatus } from './render-status.js'
import { whenPresent } from './when-present.js'
import { onApprove } from '../element/on-approve.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'

/** Indexed by `Number(collapsed)`, so the label needs no branch. */
const COLLAPSE_LABELS = ['Hide sentences', 'Show sentences'] as const

/** Approval, collapse and — when one exists — removing the paragraph override. */
export const renderBlockBar = (host: HTMLElement, row: BlockRow, status: string) => html`
  <div class="bar">
    ${renderStatus(status, row.translation, row.approved)}
    <label>
      <input type="checkbox" .checked=${row.approved} @change=${onApprove(host, row.id, segmentEvents.approveBlock)} />
      Approve paragraph
    </label>
    <button
      type="button"
      aria-expanded=${String(!row.collapsed)}
      @click=${() => {
        emit(host, segmentEvents.toggleCollapse, { id: row.id })
      }}
    >
      ${COLLAPSE_LABELS[Number(row.collapsed)] ?? ''} (${String(row.sentenceCount)})
    </button>
    ${whenPresent(
      row.overriding,
      () => html`
        <span class="status overriding">Overriding its sentences</span>
        <button
          type="button"
          title="Remove the paragraph translation and go back to the sentence translations"
          @click=${() => {
            emit(host, segmentEvents.clearOverride, { id: row.id })
          }}
        >
          Use sentences
        </button>
      `,
    )}
  </div>
`
