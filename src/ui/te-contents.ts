import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Project } from '../core/project/types.js'
import type { SegmentFilter } from '../core/view/types.js'
import { contentsScreenStyles } from './contents-screen-styles.js'
import { renderContents } from './render/render-contents.js'

/**
 * A document has contents, like a book.
 *
 * This is the answer to navigation being anyone's guess: titles on the left,
 * folios on the right, and each line saying what is left to do on that page.
 */
@customElement('te-contents')
export class TeContents extends LitElement {
  static override styles = contentsScreenStyles

  @property({ attribute: false })
  project: Project | undefined = undefined

  @property({ attribute: false })
  filter: SegmentFilter = 'all'

  @property({ attribute: false })
  collapsed: ReadonlySet<string> = new Set()

  @property({ type: Number })
  page = 0

  override render() {
    return renderContents(this, {
      project: this.project,
      filter: this.filter,
      collapsed: this.collapsed,
      page: this.page,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-contents': TeContents
  }
}
