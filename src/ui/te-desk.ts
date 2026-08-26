import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Project } from '../core/project/types.js'
import type { SegmentFilter } from '../core/view/types.js'
import type { Settings } from '../ports/settings-port.js'
import { defaultSettings } from '../core/settings/default-settings.js'
import { deskStyles as styles } from './desk-styles.js'
import { renderDesk } from './render/render-desk.js'

/**
 * Everything that can be done to the document, on one screen.
 *
 * These were eleven identical buttons in the page header. Grouping them by what
 * they do to your work is what lets the one that spends money look different
 * from the one that changes a filter.
 */
@customElement('te-desk')
export class TeDesk extends LitElement {
  static override styles = styles

  @property({ attribute: false })
  project: Project | undefined = undefined

  @property({ attribute: false })
  filter: SegmentFilter = 'all'

  @property({ attribute: false })
  settings: Settings = defaultSettings

  @property({ type: Boolean })
  translating = false

  @property({ attribute: false })
  undoLabel = ''

  override render() {
    return renderDesk(this, {
      project: this.project,
      filter: this.filter,
      model: this.settings.model,
      translating: this.translating,
      undoLabel: this.undoLabel,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-desk': TeDesk
  }
}
