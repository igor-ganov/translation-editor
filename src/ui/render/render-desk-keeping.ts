import { html } from 'lit'
import { whenPresent } from './when-present.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/**
 * Housekeeping, and the one control on the desk drawn in red.
 *
 * Undo appears only when there is something to undo, rather than sitting there
 * greyed out and taking up the same room as the things that work.
 */
export const renderDeskKeeping = (host: HTMLElement, undoLabel: string) => html`
  <section class="group">
    <h2>Housekeeping</h2>
    <p class="group__what">
      Settings apply to every document. The record is worth saving only when something misbehaves.
    </p>
    <menu class="acts">
      <li>
        <button type="button" class="act" @click=${send(host, editorEvents.nextUnapproved)}>
          Next page needing work
        </button>
      </li>
      <li><button type="button" class="act" @click=${send(host, editorEvents.openSettings)}>Settings</button></li>
      <li><button type="button" class="act" @click=${send(host, editorEvents.exportLog)}>Save the record</button></li>
      <li>
        <button type="button" class="act" @click=${send(host, editorEvents.closeProject)}>Back to the shelf</button>
      </li>
      ${whenPresent(
        undoLabel.length > 0,
        () => html`
          <li>
            <button type="button" class="act act--undo" @click=${send(host, editorEvents.undo)}>
              Undo ${undoLabel}
            </button>
          </li>
        `,
      )}
    </menu>
  </section>
`
