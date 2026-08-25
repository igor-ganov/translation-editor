import { Either, Schema } from 'effect'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import type { ProviderError } from '../../../ports/provider-port.js'

const Models = Schema.Struct({ data: Schema.Array(Schema.Struct({ id: Schema.String })) })

/** The `/v1/models` shape, shared by OpenAI, llama.cpp and Ollama's compat route. */
export const openaiModels = (payload: unknown): Either.Either<readonly string[], ProviderError> =>
  Either.map(decodeOrMalformed(Models)(payload), (models) => models.data.map((model) => model.id))
