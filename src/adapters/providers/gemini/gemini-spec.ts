import { Either, Option, Schema } from 'effect'
import { buildPrompt } from '../build-prompt.js'
import { outputBudget } from '../output-budget.js'
import { openApiSchema } from '../open-api-schema.js'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import { baseUrlOf } from '../base-url-of.js'
import type { ProviderSpec } from '../provider-spec.js'
import type { ProviderError } from '../../../ports/provider-port.js'

const Reply = Schema.Struct({
  candidates: Schema.Array(
    Schema.Struct({ content: Schema.Struct({ parts: Schema.Array(Schema.Struct({ text: Schema.String })) }) }),
  ),
})
const Models = Schema.Struct({ models: Schema.Array(Schema.Struct({ name: Schema.String })) })

const headers = (apiKey: string | undefined): Readonly<Record<string, string>> => ({
  'content-type': 'application/json',
  'x-goog-api-key': apiKey ?? '',
})

const geminiText = (payload: unknown): Either.Either<string, ProviderError> =>
  Either.flatMap(decodeOrMalformed(Reply)(payload), (reply) =>
    Either.fromOption(
      Option.map(Option.fromIterable(reply.candidates.flatMap((c) => c.content.parts)), (part) => part.text),
      (): ProviderError => ({ tag: 'malformedResponse', message: 'Gemini reply contained no candidate parts.' }),
    ),
  )

/** Gemini accepts only an OpenAPI-subset schema, so it gets its own dialect. */
const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com'

export const geminiSpec: ProviderSpec = {
  id: 'gemini',
  defaultBaseUrl: DEFAULT_BASE_URL,
  translateRequest: (config, request) => {
    const prompt = buildPrompt(request)
    return {
      url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1beta/models/${config.model}:generateContent`,
      method: 'POST',
      headers: headers(config.apiKey),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: {
          maxOutputTokens: outputBudget(request, 16000),
          responseMimeType: 'application/json',
          responseSchema: openApiSchema,
        },
      }),
    }
  },
  extractText: geminiText,
  modelsRequest: (config) => ({
    url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1beta/models`,
    method: 'GET',
    headers: headers(config.apiKey),
    body: undefined,
  }),
  extractModels: (payload) =>
    Either.map(decodeOrMalformed(Models)(payload), (reply) =>
      reply.models.map((model) => model.name.replace(/^models\//, '')),
    ),
}
