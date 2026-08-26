import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { SentenceMode } from './sentence-mode.js'
import { onSplit } from '../element/on-split.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'
import { whenPresent } from './when-present.js'
import { commandIcon } from './command-icon.js'

const merging = (host: HTMLElement, row: SentenceRow) => () => {
  emit(host, segmentEvents.mergeNext, { id: row.id })
}

/**
 * What a sentence break is, and how to mend one that fell in the wrong place.
 *
 * The two repairs were on the page with no explanation of why a document would
 * need them, which left a reader asking what "merge with next" was even for.
 */
export const renderMend = (host: HTMLElement, row: SentenceRow, mode: SentenceMode) =>
  whenPresent(
    mode.mending,
    () => html`
      <div class="mend">
        <p class="aside">
          The document was cut into sentences automatically when it was imported, and each sentence is
          translated and approved on its own. Where a cut fell in the wrong place, mend it here. The
          original wording never changes: only where one sentence ends and the next begins.
        </p>
        <menu class="acts">
          <li>
            <button type="button" class="act" @click=${merging(host, row)}>
              ${commandIcon('merge')}Join this to the next sentence
            </button>
          </li>
          <li>
            <button type="button" class="act" @click=${onSplit(host, row)}>
              ${commandIcon('split')}Cut it in two where I tapped
            </button>
          </li>
        </menu>
        <p class="aside mend__note">
          To cut, first tap in the original above, at the point the next sentence should start.
          Either repair can be undone on its own from the desk.
        </p>
      </div>
    `,
  )
