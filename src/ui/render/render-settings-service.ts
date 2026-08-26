import { html } from 'lit'
import type { ProviderId } from '../../ports/provider-port.js'
import type { SettingsView } from './settings-view.js'
import { onProviderChange } from '../element/on-provider-change.js'
import { projectEvents } from '../element/project-events.js'
import { providerLabel } from './provider-label.js'
import { renderOptions } from './render-options.js'
import { renderProviderFields } from './render-provider-fields.js'
import { renderVerdict } from './render-verdict.js'
import { sendForm } from './send-form.js'

const PROVIDERS: readonly ProviderId[] = ['anthropic', 'openai', 'gemini', 'ollama', 'llamacpp']

/** The service, the model it runs, and the credentials that service needs. */
export const renderSettingsService = (host: HTMLElement, view: SettingsView) => html`
  <section>
    <label class="field">
      <span class="field__name">Service</span>
      <span class="field__box">
        <select name="providerId" @change=${onProviderChange(view.choose)}>
          ${renderOptions(PROVIDERS, providerLabel, view.providerId)}
        </select>
      </span>
    </label>

    <label class="field">
      <span class="field__name">Model</span>
      <span class="field__box"><input name="model" .value=${view.settings.model} /></span>
      <small class="field__note">The name the service publishes. A near miss is refused at the first request.</small>
    </label>

    ${renderProviderFields(view.providerId, view.settings)} ${renderVerdict(view.verdict)}

    <menu class="acts acts--check">
      <li>
        <button class="act" type="button" @click=${sendForm(host, projectEvents.testProvider)}>Check it works</button>
      </li>
    </menu>
  </section>
`
