import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { onSplit } from '../element/on-split.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'
import { commandIcon } from './command-icon.js'

/** Indexed by `Number(approved)`, so the word and its hint need no branch. */
const APPROVE_WORDS: readonly string[] = ['approve', 'unapprove']
const APPROVE_ICONS: readonly ('approve' | 'unapprove')[] = ['approve', 'unapprove']

const merging = (host: HTMLElement, row: SentenceRow) => () => {
  emit(host, segmentEvents.mergeNext, { id: row.id })
}

/** Everything that can be done to one sentence, and nothing that merely describes it. */
export const renderLeafActs = (host: HTMLElement, row: SentenceRow, mode: LeafEditing) => html`
  ${whenPresent(
    ![mode.editing, row.superseded].some(Boolean),
    () => html`<li>
      <button type="button" class="act act--quiet" title="Write or change this translation" @click=${mode.start}>
        ${commandIcon('edit')}edit
      </button>
    </li>`,
  )}
  <li>
    <button
      type="button"
      class="act act--quiet"
      aria-pressed=${row.approved}
      ?disabled=${row.superseded || textOf(row.translation).length === 0}
      title="Mark this translation as final"
      @click=${onApprove(host, row.id, row.approved, segmentEvents.approve)}
    >
      ${commandIcon(APPROVE_ICONS[Number(row.approved)] ?? 'approve')}${APPROVE_WORDS[Number(row.approved)] ?? ''}
    </button>
  </li>
  <li>
    <button type="button" class="act act--quiet" @click=${merging(host, row)}
      title="This sentence was split in the wrong place: join it to the one after it">
      ${commandIcon('merge')}merge with next
    </button>
  </li>
  <li>
    <button type="button" class="act act--quiet" @click=${onSplit(host, row)}
      title="Split this sentence in two, at the point you tapped in the original">
      ${commandIcon('split')}split here
    </button>
  </li>
`
