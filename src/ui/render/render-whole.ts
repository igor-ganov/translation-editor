import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { blockKindLabel } from '../block-kind-label.js'
import { statusId } from '../element/status-id.js'
import { textOf } from '../element/text-of.js'
import { onInput } from '../element/on-input.js'
import { onCommit } from '../element/on-commit.js'
import { renderMark } from './render-mark.js'
import { renderWholeActs } from './render-whole-acts.js'
import { renderOverrideNote } from './render-override-note.js'

/** Indexed by `Number(overriding)`, so the class list needs no branch. */
const RULING: readonly string[] = ['whole', 'whole whole--ruling']

/** A paragraph, and the one line that can be written to stand for all of it. */
export const renderWhole = (host: HTMLElement, row: BlockRow) => {
  const status = statusId(row.id)
  return html`
    <section class=${RULING[Number(row.overriding)] ?? 'whole'} role="listitem" aria-labelledby=${status}>
      <p class="kicker">${blockKindLabel(row.block.kind)}</p>
      <p class="leaf__pair">
        <span class="leaf__source">${row.block.text}</span>
        <textarea
          class="leaf__target"
          rows="1"
          placeholder="optional. A line here replaces the sentences below"
          .value=${textOf(row.translation)}
          aria-label="Whole-paragraph translation, which replaces the sentences below"
          aria-describedby=${status}
          @input=${onInput}
          @change=${onCommit(host, row.id)}
        ></textarea>
      </p>
      <p class="leaf__margin">
        ${renderMark(status, row.translation, row.approved)} ${renderWholeActs(host, row)}
      </p>
      ${renderOverrideNote(host, row)}
    </section>
  `
}
