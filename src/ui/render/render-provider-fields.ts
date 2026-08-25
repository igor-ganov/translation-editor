import { html } from 'lit'
import type { ProviderId } from '../../ports/provider-port.js'
import type { Settings } from '../../ports/settings-port.js'
import { isLocalProvider } from '../../core/settings/is-local-provider.js'
import { needsApiKey } from '../../core/settings/needs-api-key.js'
import { whenPresent } from './when-present.js'

const PLACEHOLDERS: Readonly<Record<string, string>> = {
  ollama: 'http://127.0.0.1:11434',
  llamacpp: 'http://127.0.0.1:8080',
}

const keyLabel: Readonly<Record<string, string>> = { llamacpp: 'API key (only if the server was started with one)' }

/**
 * Only the fields the chosen provider actually uses. A cloud provider has a
 * fixed endpoint, so asking for a base URL there is noise; Ollama has no auth,
 * so asking for a key there is worse than noise.
 */
export const renderProviderFields = (providerId: ProviderId, settings: Settings) => html`
  ${whenPresent(
    needsApiKey(providerId),
    () => html`<label>${keyLabel[providerId] ?? 'API key'}
      <input name="apiKey" type="password" autocomplete="off" .value=${settings.apiKeys[providerId] ?? ''} />
    </label>`,
  )}
  ${whenPresent(
    isLocalProvider(providerId),
    () => html`<label>Server address
      <input name="baseUrl" .value=${settings.baseUrl ?? ''} placeholder=${PLACEHOLDERS[providerId] ?? ''} />
    </label>`,
  )}
`
