import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { blockKindLabel } from '../block-kind-label.js'
import { statusId } from '../element/status-id.js'
import { textOf } from '../element/text-of.js'
import { onInput } from '../element/on-input.js'
import { onCommit } from '../element/on-commit.js'
import { renderBlockBar } from './render-block-bar.js'

const header = (host: HTMLElement, row: BlockRow) => {
  const status = statusId(row.id)
  return html`
    <div class="grid" role="listitem" aria-labelledby=${status}>
      <p class="kind">${blockKindLabel(row.block.kind)}</p>
      <p class="source">${row.block.text}</p>
      <textarea
        .value=${textOf(row.translation)}
        aria-label="Whole-paragraph translation, overrides the sentences below"
        aria-describedby=${status}
        placeholder="Optional — a translation here replaces the sentence translations"
        @input=${onInput}
        @change=${onCommit(host, row.id)}
      ></textarea>
      ${renderBlockBar(host, row, status)}
    </div>
  `
}

/** The paragraph header row, or nothing while the row is still being assigned. */
export const renderBlockRow = (host: HTMLElement, row: BlockRow | undefined) =>
  pipe(
    fromUndefined(row),
    Option.map((present) => header(host, present)),
    Option.getOrElse(() => nothing),
  )
