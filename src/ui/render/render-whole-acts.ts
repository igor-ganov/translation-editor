import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'

/** Indexed by `Number(...)`, so the wording needs no branch. */
const SENTENCE_WORDS: readonly string[] = ['hide the sentences', 'show the sentences']
const APPROVE_WORDS: readonly string[] = ['approve', 'unapprove']
const WRITE_WORDS: readonly string[] = ['translate the paragraph as one', 'edit']

const collapsing = (host: HTMLElement, row: BlockRow) => () => {
  emit(host, segmentEvents.toggleCollapse, { id: row.id })
}

/** Writing the paragraph's own translation, approving it, and folding its sentences away. */
export const renderWholeActs = (host: HTMLElement, row: BlockRow, mode: LeafEditing) => html`
  ${whenPresent(
    !mode.editing,
    () => html`
      <button
        type="button"
        class="act act--quiet"
        title="One translation for the whole paragraph, used instead of the sentence translations"
        @click=${mode.start}
      >
        ${WRITE_WORDS[Number(textOf(row.translation).length > 0)] ?? 'edit'}
      </button>
    `,
  )}
  <button
    type="button"
    class="act act--quiet"
    aria-pressed=${row.approved}
    title="Mark this paragraph as final"
    @click=${onApprove(host, row.id, row.approved, segmentEvents.approveBlock)}
  >
    ${APPROVE_WORDS[Number(row.approved)] ?? 'approve'}
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
