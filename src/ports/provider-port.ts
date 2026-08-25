import type { Effect } from 'effect'
import type { LanguageTag } from '../core/document/types.js'

export type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'llamacpp'

export type ProviderConfig = {
  readonly apiKey: string | undefined
  readonly baseUrl: string | undefined
  readonly model: string
}

export type TranslatableSegment = { readonly id: string; readonly text: string }

export type TranslateRequest = {
  readonly segments: readonly TranslatableSegment[]
  readonly from: LanguageTag
  readonly to: LanguageTag
  /** Neighbouring source text the model may read but must not translate. */
  readonly context: string
}

/**
 * Failures are classified, not just reported, because the retry policy depends on
 * the class: only `transient` is worth trying again.
 */
export type ProviderError =
  | { readonly tag: 'transient'; readonly status: number | undefined; readonly message: string }
  | { readonly tag: 'auth'; readonly message: string }
  | { readonly tag: 'badRequest'; readonly message: string }
  | { readonly tag: 'malformedResponse'; readonly message: string }

export type TranslationProvider = {
  readonly id: ProviderId
  readonly listModels: () => Effect.Effect<readonly string[], ProviderError>
  readonly translate: (
    request: TranslateRequest,
  ) => Effect.Effect<readonly TranslatableSegment[], ProviderError>
}
