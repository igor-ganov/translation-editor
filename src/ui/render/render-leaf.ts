import { html } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { LeafEditing } from './leaf-editing.js'
import { statusId } from '../element/status-id.js'
import { renderMark } from './render-mark.js'
import { renderFailureNote } from './render-failure-note.js'
import { renderLeafActs } from './render-leaf-acts.js'
import { renderTarget } from './render-target.js'

/** Indexed by `Number(editing)`: the editor spans the page, reading stays in columns. */
const SHAPE: readonly string[] = ['leaf__pair', 'leaf__pair leaf__pair--writing']

/**
 * One sentence on the page: the original, and the translation written under it.
 *
 * That is the order the work happens in on paper — read the original, write
 * beneath it — and both are set in the same face and measure so the eye compares
 * like with like instead of crossing a boundary between a document and a form.
 */
export const renderLeaf = (host: HTMLElement, row: SentenceRow, mode: LeafEditing) => {
  const status = statusId(row.id)
  const writing = {
    id: row.id,
    translation: row.translation,
    label: `Translation of: ${row.source}`,
    status,
    done: mode.done,
  }
  return html`
    <article class="leaf" role="listitem" aria-labelledby=${status}>
      <p class=${SHAPE[Number(mode.editing)] ?? ''}>
        <span class="leaf__source">${row.source}</span>
        ${renderTarget(host, writing, mode.editing)}
      </p>
      <p class="leaf__margin">
        ${renderMark(status, row.translation, row.approved)} ${renderFailureNote(row.translation)}
        ${renderLeafActs(host, row, mode)}
      </p>
    </article>
  `
}
