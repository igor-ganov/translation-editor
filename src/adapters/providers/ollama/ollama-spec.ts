import { Either, Schema } from 'effect'
import { buildPrompt } from '../build-prompt.js'
import { outputBudget } from '../output-budget.js'
import { strictJsonSchema } from '../strict-json-schema.js'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import { baseUrlOf } from '../base-url-of.js'
import type { ProviderSpec } from '../provider-spec.js'

const Reply = Schema.Struct({ message: Schema.Struct({ content: Schema.String }) })
const Tags = Schema.Struct({ models: Schema.Array(Schema.Struct({ name: Schema.String })) })

const headers: Readonly<Record<string, string>> = { 'content-type': 'application/json' }

/**
 * A local Ollama server. It needs no key, sizes output with `options.num_predict`,
 * and enforces the schema by grammar sampling through its `format` field.
 *
 * Reaching it from a browser requires `OLLAMA_ORIGINS` to include the app origin;
 * under Tauri the request comes from Rust and no such setting is needed.
 */
const DEFAULT_BASE_URL = 'http://127.0.0.1:11434'

export const ollamaSpec: ProviderSpec = {
  id: 'ollama',
  defaultBaseUrl: DEFAULT_BASE_URL,
  translateRequest: (config, request) => {
    const prompt = buildPrompt(request)
    return {
      url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/api/chat`,
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: strictJsonSchema,
        options: { num_predict: outputBudget(request, 8192) },
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      }),
    }
  },
  extractText: (payload) =>
    Either.map(decodeOrMalformed(Reply)(payload), (reply) => reply.message.content),
  modelsRequest: (config) => ({
    url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/api/tags`,
    method: 'GET',
    headers,
    body: undefined,
  }),
  extractModels: (payload) =>
    Either.map(decodeOrMalformed(Tags)(payload), (reply) => reply.models.map((model) => model.name)),
}
