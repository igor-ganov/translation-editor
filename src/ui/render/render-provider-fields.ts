import { html } from 'lit'
import type { ProviderId } from '../../ports/provider-port.js'
import type { Settings } from '../../ports/settings-port.js'
import { isLocalProvider } from '../../core/settings/is-local-provider.js'
import { needsApiKey } from '../../core/settings/needs-api-key.js'
import { providerLabel } from './provider-label.js'
import { whenPresent } from './when-present.js'

const ADDRESS: Readonly<Partial<Record<ProviderId, string>>> = {
  ollama: 'http://127.0.0.1:11434',
  llamacpp: 'http://127.0.0.1:8080',
}

const KEY_NOTE: Readonly<Partial<Record<ProviderId, string>>> = {
  llamacpp: 'Needed only if the server was started with a key of its own.',
}

const keyNote = (providerId: ProviderId): string =>
  KEY_NOTE[providerId] ?? `Only ${providerLabel[providerId]} ever sees this.`

/**
 * Only the fields the chosen service actually uses. A cloud service has a fixed
 * endpoint, so asking for an address there is noise; Ollama has no authentication
 * at all, so asking for a key there implies one is needed.
 */
export const renderProviderFields = (providerId: ProviderId, settings: Settings) => html`
  ${whenPresent(
    needsApiKey(providerId),
    () => html`<label class="field">
      <span class="field__name">Key</span>
      <span class="field__box">
        <input name="apiKey" type="password" autocomplete="off" .value=${settings.apiKeys[providerId] ?? ''} />
      </span>
      <small class="field__note">${keyNote(providerId)}</small>
    </label>`,
  )}
  ${whenPresent(
    isLocalProvider(providerId),
    () => html`<label class="field">
      <span class="field__name">Address</span>
      <span class="field__box">
        <input name="baseUrl" .value=${settings.baseUrl ?? ''} placeholder=${ADDRESS[providerId] ?? ''} />
      </span>
      <small class="field__note">Text is sent to this machine and to nowhere else.</small>
    </label>`,
  )}
`
