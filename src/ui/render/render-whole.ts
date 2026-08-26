import { html } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { blockKindLabel } from '../block-kind-label.js'
import { statusId } from '../element/status-id.js'
import { textOf } from '../element/text-of.js'
import { whenPresent } from './when-present.js'
import { renderMark } from './render-mark.js'
import { renderWholeActs } from './render-whole-acts.js'
import { renderOverrideNote } from './render-override-note.js'
import { renderTarget } from './render-target.js'

/** Indexed by `Number(overriding)`, so the class list needs no branch. */
const RULING: readonly string[] = ['whole', 'whole whole--ruling']

/** A paragraph, and the one line that can be written to stand for all of it. */
export const renderWhole = (host: HTMLElement, row: BlockRow, mode: LeafEditing) => {
  const status = statusId(row.id)
  const writing = {
    id: row.id,
    translation: row.translation,
    label: 'Whole-paragraph translation, which replaces the sentences below',
    status,
    done: mode.done,
  }
  return html`
    <section class=${RULING[Number(row.overriding)] ?? 'whole'} role="listitem" aria-labelledby=${status}>
      <p class="kicker">${blockKindLabel(row.block.kind)}</p>
      <p class="leaf__pair leaf__pair--writing">
        <span class="leaf__source">${row.block.text}</span>
        ${whenPresent(
          [mode.editing, textOf(row.translation).length > 0].some(Boolean),
          () => renderTarget(host, writing, mode.editing),
        )}
      </p>
      <p class="leaf__margin">
        ${renderMark(status, row.translation, row.approved)} ${renderWholeActs(host, row, mode)}
      </p>
      ${renderOverrideNote(host, row)}
    </section>
  `
}
