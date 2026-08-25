import { Effect, Either, Schema, pipe } from 'effect'
import type { HttpPort } from '../../ports/http-port.js'
import type {
  ProviderConfig,
  ProviderError,
  TranslatableSegment,
  TranslateRequest,
  TranslationProvider,
} from '../../ports/provider-port.js'
import type { ProviderSpec } from './provider-spec.js'
import { sendAndDecode } from './send-and-decode.js'
import { decodeOrMalformed } from './decode-or-malformed.js'
import { parseJson } from './parse-json.js'
import { translationSchema } from './translation-schema.js'

const readSegments = (raw: string): Either.Either<readonly TranslatableSegment[], ProviderError> =>
  pipe(
    parseJson(raw),
    Either.flatMap(decodeOrMalformed(Schema.asSchema(translationSchema))),
    Either.map((decoded) => decoded.segments),
  )

/**
 * Turns a provider specification into a working provider. Everything shared —
 * transport, status classification, JSON parsing, schema validation — lives here,
 * so each adapter only describes what its API genuinely does differently.
 */
export const makeProvider =
  (spec: ProviderSpec) =>
  (config: ProviderConfig) =>
  (http: HttpPort): TranslationProvider => ({
    id: spec.id,
    listModels: () =>
      pipe(
        sendAndDecode(http)(spec.modelsRequest(config)),
        Effect.flatMap((payload) => spec.extractModels(payload)),
      ),
    translate: (request: TranslateRequest) =>
      pipe(
        sendAndDecode(http)(spec.translateRequest(config, request)),
        Effect.flatMap((payload) => spec.extractText(payload)),
        Effect.flatMap(readSegments),
      ),
  })
