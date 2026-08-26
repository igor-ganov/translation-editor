import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'
import { commandIcon } from './command-icon.js'

/** Indexed by `Number(...)`, so the wording and its hint need no branch. */
const FOLD_WORDS: readonly string[] = ['hide the sentences', 'show the sentences']
const FOLD_ICONS: readonly ('fold' | 'unfold')[] = ['fold', 'unfold']
const APPROVE_WORDS: readonly string[] = ['approve', 'unapprove']
const APPROVE_ICONS: readonly ('approve' | 'unapprove')[] = ['approve', 'unapprove']
const WRITE_WORDS: readonly string[] = ['translate the paragraph as one', 'edit']

const collapsing = (host: HTMLElement, row: BlockRow) => () => {
  emit(host, segmentEvents.toggleCollapse, { id: row.id })
}

/** Everything that can be done to one paragraph, and nothing that describes it. */
export const renderWholeActs = (host: HTMLElement, row: BlockRow, mode: LeafEditing) => html`
  ${whenPresent(
    !mode.editing,
    () => html`<li>
      <button type="button" class="act act--quiet" @click=${mode.start}
        title="One translation for the whole paragraph, used instead of the sentence translations">
        ${commandIcon('edit')}${WRITE_WORDS[Number(textOf(row.translation).length > 0)] ?? ''}
      </button>
    </li>`,
  )}
  <li>
    <button
      type="button"
      class="act act--quiet"
      aria-pressed=${row.approved}
      title="Mark this paragraph as final"
      @click=${onApprove(host, row.id, row.approved, segmentEvents.approveBlock)}
    >
      ${commandIcon(APPROVE_ICONS[Number(row.approved)] ?? 'approve')}${APPROVE_WORDS[Number(row.approved)] ?? ''}
    </button>
  </li>
  <li>
    <button type="button" class="act act--quiet" aria-expanded=${String(!row.collapsed)}
      @click=${collapsing(host, row)}>
      ${commandIcon(FOLD_ICONS[Number(row.collapsed)] ?? 'fold')}${FOLD_WORDS[Number(row.collapsed)] ?? ''}
      (${String(row.sentenceCount)})
    </button>
  </li>
`
