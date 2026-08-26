import { html } from 'lit'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'
import { sendForm } from './send-form.js'

/**
 * Saving is the one thing on this screen that commits, so it is the one filled
 * control. Leaving without saving costs nothing and is drawn as costing nothing.
 */
export const renderSettingsActions = (host: HTMLElement) => html`
  <menu class="acts acts--close">
    <li>
      <button class="act act--commit" type="button" @click=${sendForm(host, projectEvents.saveSettings)}>Save</button>
    </li>
    <li>
      <button
        class="act"
        type="button"
        @click=${() => {
          emit(host, projectEvents.back, {})
        }}
      >
        Discard
      </button>
    </li>
  </menu>
`
