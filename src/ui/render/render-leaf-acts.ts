import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { SentenceMode } from './sentence-mode.js'
import { textOf } from '../element/text-of.js'
import { onApprove } from '../element/on-approve.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'
import { commandIcon } from './command-icon.js'

/** Indexed by `Number(approved)`, so the word and its hint need no branch. */
const APPROVE_WORDS: readonly string[] = ['approve', 'unapprove']
const APPROVE_ICONS: readonly ('approve' | 'unapprove')[] = ['approve', 'unapprove']

/**
 * The three things done to a sentence. Repairing a sentence break is one of
 * them and not two, because a reader meeting "merge with next" and "split here"
 * side by side has no way to tell what either is for.
 */
export const renderLeafActs = (host: HTMLElement, row: SentenceRow, mode: SentenceMode) => html`
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
    <button type="button" class="act act--quiet" aria-expanded=${mode.mending} @click=${mode.mend}
      title="This sentence starts or ends in the wrong place">
      ${commandIcon('split')}sentence break
    </button>
  </li>
`
