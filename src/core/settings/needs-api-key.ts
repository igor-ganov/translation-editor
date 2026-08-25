import type { ProviderId } from '../../ports/provider-port.js'

/**
 * Whether the provider authenticates at all.
 *
 * Ollama has no auth; llama.cpp only has one if the server was started with
 * `--api-key`, so its field is offered but described as optional.
 */
export const needsApiKey = (providerId: ProviderId): boolean => providerId !== 'ollama'
