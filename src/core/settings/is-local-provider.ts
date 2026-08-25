import type { ProviderId } from '../../ports/provider-port.js'

/**
 * Whether the provider runs on the user's own machine.
 *
 * Only these two need a base URL — the cloud endpoints are fixed — and only
 * these two work without an API key, so the settings form asks for each field
 * exactly where it means something.
 */
export const isLocalProvider = (providerId: ProviderId): boolean => {
  switch (providerId) {
    case 'ollama':
    case 'llamacpp':
      return true
    case 'anthropic':
    case 'openai':
    case 'gemini':
      return false
  }
}
