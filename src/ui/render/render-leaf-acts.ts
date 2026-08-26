import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import { textOf } from '../element/text-of.js'
import { onSettle } from '../element/on-settle.js'
import { onSplit } from '../element/on-split.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'

/** Indexed by `Number(approved)`, which keeps the wording branch-free. */
const SETTLE_WORDS: readonly string[] = ['settle', 'unsettle']

const joining = (host: HTMLElement, row: SentenceRow) => () => {
  emit(host, segmentEvents.mergeNext, { id: row.id })
}

/**
 * The commands in the margin. All of them only rearrange work you already have,
 * so all of them are plain words rather than outlines.
 */
export const renderLeafActs = (host: HTMLElement, row: SentenceRow) => html`
  <button
    type="button"
    class="act act--quiet"
    aria-pressed=${row.approved}
    ?disabled=${row.superseded || textOf(row.translation).length === 0}
    @click=${onSettle(host, row.id, row.approved, segmentEvents.approve)}
  >
    ${SETTLE_WORDS[Number(row.approved)] ?? 'settle'}
  </button>
  <button type="button" class="act act--quiet" title="Join this sentence to the one after it"
    @click=${joining(host, row)}>
    join
  </button>
  <button type="button" class="act act--quiet" title="Break at the point you tapped in the source"
    @click=${onSplit(host, row)}>
    break
  </button>
`
