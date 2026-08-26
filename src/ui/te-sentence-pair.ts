import { LitElement } from 'lit'
import type { PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { SentenceRow } from '../core/view/types.js'
import type { LeafOpen } from './element/next-open.js'
import { nextOpen } from './element/next-open.js'
import { pairStyles } from './pair-styles.js'
import { renderSentencePair } from './render/render-sentence-pair.js'
import { openField } from './element/open-field.js'

/**
 * One source sentence beside its translation.
 *
 * Which panel this line has open is held here and nowhere else: it is not part
 * of the document, so it should not survive a reload or travel to another screen.
 */
@customElement('te-sentence-pair')
export class TeSentencePair extends LitElement {
  static override styles = pairStyles

  @property({ attribute: false })
  row: SentenceRow | undefined = undefined

  @state()
  private open: LeafOpen = 'read'

  private readonly acts = {
    start: (): void => {
      this.open = 'write'
    },
    mend: (): void => {
      this.open = nextOpen(this.open)
    },
    done: (): void => {
      this.open = 'read'
    },
  }

  protected override updated(changed: PropertyValues): void {
    openField(this, [changed.has('open'), this.open === 'write'].every(Boolean))
  }

  override render() {
    const mode = { ...this.acts, editing: this.open === 'write', mending: this.open === 'mend' }
    return renderSentencePair(this, this.row, mode)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-sentence-pair': TeSentencePair
  }
}
