import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import { statusId } from '../element/status-id.js'
import { textOf } from '../element/text-of.js'
import { onInput } from '../element/on-input.js'
import { onCommit } from '../element/on-commit.js'
import { onFieldKey } from '../element/on-field-key.js'
import { renderMark } from './render-mark.js'
import { renderFailureNote } from './render-failure-note.js'
import { renderLeafActs } from './render-leaf-acts.js'

/**
 * One sentence on the page: the original, and the translation written under it.
 *
 * That is the order the work happens in on paper — read the original, write
 * beneath it — and both are set in the same face and measure so the eye compares
 * like with like instead of crossing a boundary between a document and a form.
 */
export const renderLeaf = (host: HTMLElement, row: SentenceRow) => {
  const status = statusId(row.id)
  return html`
    <article class="leaf" role="listitem" aria-labelledby=${status}>
      <p class="leaf__pair">
        <span class="leaf__source">${row.source}</span>
        <textarea
          class="leaf__target"
          rows="1"
          placeholder="nothing yet"
          .value=${textOf(row.translation)}
          aria-label="Translation of: ${row.source}"
          aria-describedby=${status}
          ?readonly=${row.superseded}
          @input=${onInput}
          @change=${onCommit(host, row.id)}
          @keydown=${onFieldKey(host, row.id)}
        ></textarea>
      </p>
      <p class="leaf__margin">
        ${renderMark(status, row.translation, row.approved)} ${renderFailureNote(row.translation)}
        ${renderLeafActs(host, row)}
      </p>
    </article>
  `
}
