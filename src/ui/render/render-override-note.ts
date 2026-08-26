import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { whenPresent } from './when-present.js'
import { emit } from '../element/emit.js'
import { segmentEvents } from '../element/segment-events.js'

const restoring = (host: HTMLElement, row: BlockRow) => () => {
  emit(host, segmentEvents.clearOverride, { id: row.id })
}

/**
 * Shown only while a paragraph translation is in force.
 *
 * Going back to the sentences is an outline rather than a plain word: it changes
 * which text the document exports, so it deserves more weight than settling —
 * and it is still one tap to undo.
 */
export const renderOverrideNote = (host: HTMLElement, row: BlockRow) =>
  whenPresent(
    row.overriding,
    () => html`
      <p class="aside">
        Written here, one line replaces the sentences below. Useful when the two languages break
        the thought differently and a sentence-by-sentence rendering reads badly.
      </p>
      <menu class="acts">
        <li><button type="button" class="act" @click=${restoring(host, row)}>Go back to the sentences</button></li>
      </menu>
    `,
  )
