import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { onSplit } from '../element/on-split.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'

/** Indexed by `Number(approved)`, which keeps the wording branch-free. */
const APPROVE_WORDS: readonly string[] = ['approve', 'unapprove']

const merging = (host: HTMLElement, row: SentenceRow) => () => {
  emit(host, segmentEvents.mergeNext, { id: row.id })
}

/**
 * The commands for one sentence. Each says what it does to that sentence, in
 * the words the task uses, rather than in a shorter word chosen to fit a metaphor.
 */
export const renderLeafActs = (host: HTMLElement, row: SentenceRow, mode: LeafEditing) => html`
  ${whenPresent(
    ![mode.editing, row.superseded].some(Boolean),
    () => html`<button type="button" class="act act--quiet" @click=${mode.start}>edit</button>`,
  )}
  <button
    type="button"
    class="act act--quiet"
    aria-pressed=${row.approved}
    ?disabled=${row.superseded || textOf(row.translation).length === 0}
    title="Mark this translation as final"
    @click=${onApprove(host, row.id, row.approved, segmentEvents.approve)}
  >
    ${APPROVE_WORDS[Number(row.approved)] ?? 'approve'}
  </button>
  <button type="button" class="act act--quiet" title="The sentence was split in the wrong place: join it to the one after it"
    @click=${merging(host, row)}>
    merge with next
  </button>
  <button type="button" class="act act--quiet" title="Split this sentence in two, at the point you tapped in the original"
    @click=${onSplit(host, row)}>
    split here
  </button>
`
