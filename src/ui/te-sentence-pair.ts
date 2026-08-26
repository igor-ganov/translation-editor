import { LitElement } from 'lit'
import type { PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { SentenceRow } from '../core/view/types.js'
import { pairStyles } from './pair-styles.js'
import { renderSentencePair } from './render/render-sentence-pair.js'
import { openField } from './element/open-field.js'

/**
 * One source sentence beside its translation.
 *
 * Whether this line is being edited is held here and nowhere else: it is not
 * part of the document, so it should not survive a reload or travel with the
 * project to another screen.
 */
@customElement('te-sentence-pair')
export class TeSentencePair extends LitElement {
  static override styles = pairStyles

  @property({ attribute: false })
  row: SentenceRow | undefined = undefined

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
    return renderSentencePair(this, this.row, { ...this.mode, editing: this.editing })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-sentence-pair': TeSentencePair
  }
}
