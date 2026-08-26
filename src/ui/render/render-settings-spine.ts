import { html } from 'lit'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'

/** Indexed by `Number(hasDocument)`, so the wording needs no branch. */
const BACK: readonly string[] = ['Shelf', 'Back to the document']

/** Where you are, and the way back to wherever you came from. */
export const renderSettingsSpine = (host: HTMLElement, hasDocument: boolean) => html`
  <header class="spine">
    <button
      class="act act--quiet"
      type="button"
      @click=${() => {
        emit(host, projectEvents.back, {})
      }}
    >
      ${BACK[Number(hasDocument)] ?? 'Shelf'}
    </button>
    <span class="spine__work">Settings</span>
  </header>
`
