import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { onSettle } from '../element/on-settle.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'

/** Indexed by `Number(collapsed)`, so the wording needs no branch. */
const SENTENCE_WORDS: readonly string[] = ['hide the sentences', 'show the sentences']
const SETTLE_WORDS: readonly string[] = ['settle', 'unsettle']

const collapsing = (host: HTMLElement, row: BlockRow) => () => {
  emit(host, segmentEvents.toggleCollapse, { id: row.id })
}

/** Settling the paragraph, and folding its sentences out of the way. */
export const renderWholeActs = (host: HTMLElement, row: BlockRow) => html`
  <button
    type="button"
    class="act act--quiet"
    aria-pressed=${row.approved}
    @click=${onSettle(host, row.id, row.approved, segmentEvents.approveBlock)}
  >
    ${SETTLE_WORDS[Number(row.approved)] ?? 'settle'}
  </button>
  <button
    type="button"
    class="act act--quiet"
    aria-expanded=${String(!row.collapsed)}
    @click=${collapsing(host, row)}
  >
    ${SENTENCE_WORDS[Number(row.collapsed)] ?? ''} (${String(row.sentenceCount)})
  </button>
`
