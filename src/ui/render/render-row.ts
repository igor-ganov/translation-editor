import { html } from 'lit'
import type { EditorRow } from '../../core/view/types.js'
import '../te-block-row.js'
import '../te-sentence-pair.js'

/** Dispatches a row to its element. Exhaustive over the row union by construction. */
export const renderRow = (row: EditorRow) => {
  switch (row.tag) {
    case 'block':
      return html`<te-block-row .row=${row}></te-block-row>`
    case 'sentence':
      return html`<te-sentence-pair .row=${row}></te-sentence-pair>`
  }
}
