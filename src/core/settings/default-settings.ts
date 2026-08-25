import type { Settings } from '../../ports/settings-port.js'

/**
 * The app must be fully usable before any provider is configured — import, edit,
 * approve, export and the markup round trip all work offline — so the defaults
 * describe a valid, keyless state rather than an unconfigured one.
 */
export const defaultSettings: Settings = {
  providerId: 'anthropic',
  model: 'claude-opus-5',
  baseUrl: undefined,
  apiKeys: {},
  defaultLanguages: { from: 'en', to: 'ru' },
  batchTokens: 2000,
  lastProjectId: undefined,
}
