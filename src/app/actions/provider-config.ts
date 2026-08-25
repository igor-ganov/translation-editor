import type { ProviderConfig } from '../../ports/provider-port.js'
import type { Settings } from '../../ports/settings-port.js'

/** Turns stored settings into the configuration the selected provider expects. */
export const providerConfig = (settings: Settings): ProviderConfig => ({
  apiKey: settings.apiKeys[settings.providerId],
  baseUrl: settings.baseUrl,
  model: settings.model,
})
