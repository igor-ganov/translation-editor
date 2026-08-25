import { html } from 'lit'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'
import { readForm } from '../element/read-form.js'

/** Reads the form once and sends it, so Save and Test see identical values. */
const submit = (host: HTMLElement, name: string) => () => {
  emit(host, name, readForm(host.shadowRoot ?? host))
}

export const renderSettingsActions = (host: HTMLElement) => html`
  <div class="actions">
    <button type="button" @click=${submit(host, projectEvents.saveSettings)}>Save</button>
    <button type="button" @click=${submit(host, projectEvents.testProvider)}>Test connection</button>
    <button
      type="button"
      @click=${() => {
        emit(host, projectEvents.back, {})
      }}
    >
      Back
    </button>
  </div>
`
