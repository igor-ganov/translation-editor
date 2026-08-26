import { html } from 'lit'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'

/** Where you are, and the way back. */
export const renderSettingsSpine = (host: HTMLElement) => html`
  <header class="spine">
    <button
      class="act act--quiet"
      type="button"
      @click=${() => {
        emit(host, projectEvents.back, {})
      }}
    >
      Shelf
    </button>
    <span class="spine__work">Settings</span>
  </header>
`
