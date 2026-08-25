import { Either } from 'effect'
import type { ProviderError } from '../../ports/provider-port.js'

/** Parses a response body, turning a syntax error into a typed provider failure. */
export const parseJson = (raw: string): Either.Either<unknown, ProviderError> =>
  Either.try({
    try: (): unknown => JSON.parse(raw),
    catch: (cause): ProviderError => ({
      tag: 'malformedResponse',
      message: `Reply was not JSON: ${String(cause)}`,
    }),
  })
