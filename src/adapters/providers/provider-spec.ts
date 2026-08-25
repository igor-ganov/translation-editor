import type { Either } from 'effect'
import type { HttpRequest } from '../../ports/http-port.js'
import type { ProviderConfig, ProviderError, ProviderId, TranslateRequest } from '../../ports/provider-port.js'

export type Extraction<A> = Either.Either<A, ProviderError>

/**
 * Everything that differs between providers, and nothing that does not: the URL,
 * the auth transport, the max-tokens field name, the structured-output dialect,
 * and where in the reply the text lives. The generic engine supplies the rest.
 */
export type ProviderSpec = {
  readonly id: ProviderId
  readonly defaultBaseUrl: string
  readonly translateRequest: (config: ProviderConfig, request: TranslateRequest) => HttpRequest
  /** Pulls the model's raw text (expected to be JSON) out of the provider envelope. */
  readonly extractText: (payload: unknown) => Extraction<string>
  readonly modelsRequest: (config: ProviderConfig) => HttpRequest
  readonly extractModels: (payload: unknown) => Extraction<readonly string[]>
}
