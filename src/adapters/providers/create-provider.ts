import type { HttpPort } from '../../ports/http-port.js'
import type { ProviderConfig, ProviderId, TranslationProvider } from '../../ports/provider-port.js'
import type { ProviderSpec } from './provider-spec.js'
import { makeProvider } from './make-provider.js'
import { anthropicSpec } from './anthropic/anthropic-spec.js'
import { openaiSpec } from './openai/openai-spec.js'
import { geminiSpec } from './gemini/gemini-spec.js'
import { ollamaSpec } from './ollama/ollama-spec.js'
import { llamacppSpec } from './llamacpp/llamacpp-spec.js'

const SPECS: Record<ProviderId, ProviderSpec> = {
  anthropic: anthropicSpec,
  openai: openaiSpec,
  gemini: geminiSpec,
  ollama: ollamaSpec,
  llamacpp: llamacppSpec,
}

/** Selects a provider implementation. Adding one is a new spec plus a key here. */
export const createProvider =
  (id: ProviderId) =>
  (config: ProviderConfig) =>
  (http: HttpPort): TranslationProvider =>
    makeProvider(SPECS[id])(config)(http)
