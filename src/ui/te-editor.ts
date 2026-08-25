import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Option } from 'effect'
import type { Project } from '../core/project/types.js'
import type { SegmentFilter } from '../core/view/types.js'
import type { SegmentId } from '../core/document/types.js'
import { editorRows } from '../core/view/editor-rows.js'
import { fromUndefined } from '../core/option/from-undefined.js'
import { editorStyles } from './editor-styles.js'
import { renderEditor } from './render/render-editor.js'
import { scrollToRow } from './element/scroll-to-row.js'

/**
 * The document view: a sticky progress header over a virtualised list of
 * paragraph and sentence rows.
 */
@customElement('te-editor')
export class TeEditor extends LitElement {
  static override styles = editorStyles

  @property({ attribute: false })
  project: Project | undefined = undefined

  @property({ attribute: false })
  filter: SegmentFilter = 'all'

  @property({ attribute: false })
  collapsed: ReadonlySet<string> = new Set()

  @property({ type: Boolean })
  translating = false

  @property({ attribute: false })
  undoLabel = ''

  /** Set once after opening a document, to land the user where they left off. */
  @property({ attribute: false })
  revealSegment: SegmentId | undefined = undefined

  /** Rows are exposed so the shell can resolve an id to a position in the list. */
  get rows() {
    return Option.getOrElse(
      Option.map(fromUndefined(this.project), (project) => editorRows(project)(this.filter, this.collapsed)),
      () => [],
    )
  }

  reveal(id: SegmentId): void {
    scrollToRow(this, this.rows)(id)
  }

  protected override updated(): void {
    for (const id of Option.toArray(fromUndefined(this.revealSegment))) this.reveal(id)
  }

  override render() {
    return renderEditor(this, {
      project: this.project,
      filter: this.filter,
      collapsed: this.collapsed,
      translating: this.translating,
      undoLabel: this.undoLabel,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-editor': TeEditor
  }
}
