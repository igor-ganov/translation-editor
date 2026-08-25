import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import { renderStatus } from './render-status.js'
import { whenPresent } from './when-present.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { onSplit } from '../element/on-split.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'

/** Status, approval and the boundary fix, under the translation on a phone. */
export const renderSentenceBar = (host: HTMLElement, row: SentenceRow, status: string) => html`
  <div class="bar">
    ${renderStatus(status, row.translation, row.approved)}
    <label>
      <input
        type="checkbox"
        .checked=${row.approved}
        ?disabled=${row.superseded || textOf(row.translation).length === 0}
        @change=${onApprove(host, row.id)}
      />
      Approved
    </label>
    <button
      type="button"
      title="Join this sentence with the one after it"
      @click=${() => {
        emit(host, segmentEvents.mergeNext, { id: row.id })
      }}
    >
      Merge next
    </button>
    <button type="button" title="Split at the cursor you placed in the source text" @click=${onSplit(host, row)}>
      Split here
    </button>
    ${whenPresent(
      row.superseded,
      () => html`<span class="status">Paragraph translation is used instead</span>`,
    )}
  </div>
`
