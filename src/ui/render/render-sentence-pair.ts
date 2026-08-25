import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { statusId } from '../element/status-id.js'
import { textOf } from '../element/text-of.js'
import { onInput } from '../element/on-input.js'
import { onCommit } from '../element/on-commit.js'
import { onFieldKey } from '../element/on-field-key.js'
import { renderSentenceBar } from './render-sentence-bar.js'

const pair = (host: HTMLElement, row: SentenceRow) => {
  const status = statusId(row.id)
  return html`
    <div class="grid" role="listitem" aria-labelledby=${status}>
      <p class="source">${row.source}</p>
      <textarea
        .value=${textOf(row.translation)}
        aria-label="Translation of: ${row.source}"
        aria-describedby=${status}
        ?disabled=${row.superseded}
        @input=${onInput}
        @change=${onCommit(host, row.id)}
        @keydown=${onFieldKey(host, row.id)}
      ></textarea>
      ${renderSentenceBar(host, row, status)}
    </div>
  `
}

/** One sentence pair, or nothing while the row is still being assigned. */
export const renderSentencePair = (host: HTMLElement, row: SentenceRow | undefined) =>
  pipe(
    fromUndefined(row),
    Option.map((present) => pair(host, present)),
    Option.getOrElse(() => nothing),
  )
