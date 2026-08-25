import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { SentenceRow } from '../core/view/types.js'
import { pairStyles } from './pair-styles.js'
import { renderSentencePair } from './render/render-sentence-pair.js'

/**
 * One source sentence beside its translation.
 *
 * The class holds only the row it renders; all behaviour lives in free functions
 * that take the host, which keeps this at the framework boundary and nothing more.
 */
@customElement('te-sentence-pair')
export class TeSentencePair extends LitElement {
  static override styles = pairStyles

  @property({ attribute: false })
  row: SentenceRow | undefined = undefined

  override render() {
    return renderSentencePair(this, this.row)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-sentence-pair': TeSentencePair
  }
}
