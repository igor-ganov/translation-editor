import { Option } from 'effect'
import { html } from 'lit'
import type { SegmentFilter } from '../../core/view/types.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'
import { selectOf } from '../element/select-of.js'

const FILTERS: readonly (readonly [SegmentFilter, string])[] = [
  ['all', 'All segments'],
  ['untranslated', 'Untranslated'],
  ['unapproved', 'Unapproved'],
  ['failed', 'Failed'],
]

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

const onFilter = (host: HTMLElement) => (event: Event) => {
  for (const select of Option.toArray(selectOf(event))) {
    emit(host, editorEvents.filterChange, { filter: select.value })
  }
}

/** The header controls: what to show, and everything that acts on the document. */
export const renderEditorActions = (
  host: HTMLElement,
  filter: SegmentFilter,
  translating: boolean,
  undoLabel: string,
) => html`
  <div class="actions">
    <select aria-label="Show which segments" .value=${filter} @change=${onFilter(host)}>
      ${FILTERS.map(([value, label]) => html`<option value=${value} ?selected=${value === filter}>${label}</option>`)}
    </select>
    <button type="button" @click=${send(host, editorEvents.nextUnapproved)}>Next unapproved</button>
    <button type="button" ?hidden=${undoLabel.length === 0} @click=${send(host, editorEvents.undo)}>
      Undo ${undoLabel}
    </button>
    <button type="button" ?hidden=${translating} @click=${send(host, editorEvents.translate)}>Translate</button>
    <button type="button" ?hidden=${!translating} @click=${send(host, editorEvents.cancelTranslate)}>Cancel</button>
    <button type="button" @click=${send(host, editorEvents.exportDocx)}>Export .docx</button>
    <button type="button" @click=${send(host, editorEvents.exportMarkup)}>Export markup</button>
    <button type="button" @click=${send(host, editorEvents.importMarkup)}>Import markup</button>
    <button type="button" title="Save a diagnostic log to share" @click=${send(host, editorEvents.exportLog)}>
      Save log
    </button>
    <button type="button" @click=${send(host, editorEvents.openSettings)}>Settings</button>
    <button type="button" @click=${send(host, editorEvents.closeProject)}>Projects</button>
  </div>
`
