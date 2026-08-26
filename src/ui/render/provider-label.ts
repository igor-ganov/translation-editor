import type { ProviderId } from '../../ports/provider-port.js'

/**
 * What each service calls itself, and where it runs. The stored value stays the
 * internal id, so the name can be read as a sentence without touching storage.
 */
export const providerLabel: Readonly<Record<ProviderId, string>> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  ollama: 'Ollama, on this network',
  llamacpp: 'llama.cpp, on this network',
}
