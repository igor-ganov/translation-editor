import { Effect, Either, Option, pipe } from 'effect'
import type { HttpPort, HttpRequest } from '../../ports/http-port.js'
import type { ProviderError } from '../../ports/provider-port.js'
import { classifyStatus } from './classify-status.js'
import { parseJson } from './parse-json.js'

const checkStatus = (status: number, body: string): Either.Either<string, ProviderError> =>
  pipe(
    Option.liftPredicate((code: number) => code >= 200 && code < 300)(status),
    Option.map(() => body),
    Either.fromOption(() => classifyStatus(status, body)),
  )

/**
 * One provider round trip: send, classify the status, parse the body. A transport
 * failure is reported as transient so the retry policy treats it like a 5xx.
 */
export const sendAndDecode =
  (http: HttpPort) =>
  (request: HttpRequest): Effect.Effect<unknown, ProviderError> =>
    pipe(
      http.send(request),
      Effect.mapError((failure): ProviderError => ({
        tag: 'transient',
        status: undefined,
        message: failure.message,
      })),
      Effect.flatMap((response) => checkStatus(response.status, response.body)),
      Effect.flatMap(parseJson),
    )
