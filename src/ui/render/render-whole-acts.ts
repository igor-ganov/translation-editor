import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { textOf } from '../element/text-of.js'
import { onSettle } from '../element/on-settle.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'

/** Indexed by `Number(...)`, so the wording needs no branch. */
const SENTENCE_WORDS: readonly string[] = ['hide the sentences', 'show the sentences']
const SETTLE_WORDS: readonly string[] = ['settle', 'unsettle']
const WRITE_WORDS: readonly string[] = ['write one for the whole paragraph', 'edit']

const collapsing = (host: HTMLElement, row: BlockRow) => () => {
  emit(host, segmentEvents.toggleCollapse, { id: row.id })
}

/** Writing the paragraph's own translation, settling it, and folding its sentences away. */
export const renderWholeActs = (host: HTMLElement, row: BlockRow, mode: LeafEditing) => html`
  ${whenPresent(
    !mode.editing,
    () => html`
      <button type="button" class="act act--quiet" @click=${mode.start}>
        ${WRITE_WORDS[Number(textOf(row.translation).length > 0)] ?? 'edit'}
      </button>
    `,
  )}
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
