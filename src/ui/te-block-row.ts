import { LitElement } from 'lit'
import type { PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { BlockRow } from '../core/view/types.js'
import { blockStyles } from './block-styles.js'
import { renderBlockRow } from './render/render-block-row.js'
import { openField } from './element/open-field.js'

/**
 * A paragraph: the whole source paragraph, an optional paragraph-level
 * translation that overrides its sentences, and the controls for both.
 */
@customElement('te-block-row')
export class TeBlockRow extends LitElement {
  static override styles = blockStyles

  @property({ attribute: false })
  row: BlockRow | undefined = undefined

  @state()
  private editing = false

  private readonly mode = {
    editing: false,
    start: (): void => {
      this.editing = true
    },
    done: (): void => {
      this.editing = false
    },
  }

  protected override updated(changed: PropertyValues): void {
    openField(this, [changed.has('editing'), this.editing].every(Boolean))
  }

  override render() {
    return renderBlockRow(this, this.row, { ...this.mode, editing: this.editing })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-block-row': TeBlockRow
  }
}
