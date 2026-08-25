import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { BlockRow } from '../core/view/types.js'
import { blockStyles } from './block-styles.js'
import { renderBlockRow } from './render/render-block-row.js'

/**
 * A paragraph header: the whole source paragraph, an optional paragraph-level
 * translation that overrides its sentences, and the controls for both.
 */
@customElement('te-block-row')
export class TeBlockRow extends LitElement {
  static override styles = blockStyles

  @property({ attribute: false })
  row: BlockRow | undefined = undefined

  override render() {
    return renderBlockRow(this, this.row)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-block-row': TeBlockRow
  }
}
