import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Project } from '../core/project/types.js'
import type { SegmentFilter } from '../core/view/types.js'
import { editorStyles } from './editor-styles.js'
import { renderEditor } from './render/render-editor.js'

/**
 * One page of the document: the spine above it, the page turner below it.
 *
 * There is no virtualised list here any more. A page holds about a screenful, so
 * the rows on it can simply be rendered — which also ends the class of bug where
 * a redraw of a virtualiser threw the reader to the end of the document.
 */
@customElement('te-editor')
export class TeEditor extends LitElement {
  static override styles = editorStyles

  @property({ attribute: false })
  project: Project | undefined = undefined

  @property({ attribute: false })
  filter: SegmentFilter = 'all'

  @property({ type: Number })
  page = 0

  @property({ attribute: false })
  collapsed: ReadonlySet<string> = new Set()

  override render() {
    return renderEditor(this, {
      project: this.project,
      filter: this.filter,
      page: this.page,
      collapsed: this.collapsed,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-editor': TeEditor
  }
}
