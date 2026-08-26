import { Either, Schema } from 'effect'
import { buildPrompt } from '../build-prompt.js'
import { outputBudget } from '../output-budget.js'
import { strictJsonSchema } from '../strict-json-schema.js'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import { baseUrlOf } from '../base-url-of.js'
import type { ProviderSpec } from '../provider-spec.js'
import { anthropicHeaders } from './anthropic-headers.js'
import { anthropicText } from './anthropic-text.js'

const Models = Schema.Struct({ data: Schema.Array(Schema.Struct({ id: Schema.String })) })

const TOOL_NAME = 'emit_translations'

/**
 * Anthropic Messages API. Structured output is requested through a forced strict
 * tool call, the strongest schema guarantee the API offers.
 */
const DEFAULT_BASE_URL = 'https://api.anthropic.com'

export const anthropicSpec: ProviderSpec = {
  id: 'anthropic',
  defaultBaseUrl: DEFAULT_BASE_URL,
  translateRequest: (config, request) => {
    const prompt = buildPrompt(request)
    return {
      url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1/messages`,
      method: 'POST',
      headers: anthropicHeaders(config.apiKey),
      body: JSON.stringify({
        model: config.model,
        max_tokens: outputBudget(request, 16000),
        system: prompt.system,
        tool_choice: { type: 'tool', name: TOOL_NAME },
        tools: [
          { name: TOOL_NAME, description: 'Return exactly one translation per requested id.', input_schema: strictJsonSchema },
        ],
        messages: [{ role: 'user', content: prompt.user }],
      }),
    }
  },
  extractText: anthropicText,
  modelsRequest: (config) => ({
    url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1/models`,
    method: 'GET',
    headers: anthropicHeaders(config.apiKey),
    body: undefined,
  }),
  extractModels: (payload) =>
    Either.map(decodeOrMalformed(Models)(payload), (models) => models.data.map((model) => model.id)),
}
