import { Either, ParseResult, Schema } from 'effect'
import type { ProviderError } from '../../ports/provider-port.js'

/**
 * Validates an untyped provider reply against the envelope we expect. Providers
 * change response shape between versions, so a mismatch has to surface as a typed
 * error the UI can explain rather than as an exception from deep inside a getter.
 */
export const decodeOrMalformed =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (payload: unknown): Either.Either<A, ProviderError> =>
    Either.mapLeft(
      Schema.decodeUnknownEither(schema)(payload),
      (error): ProviderError => ({
        tag: 'malformedResponse',
        message: ParseResult.TreeFormatter.formatErrorSync(error).slice(0, 400),
      }),
    )
