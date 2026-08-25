import { buildPrompt } from '../build-prompt.js'
import { outputBudget } from '../output-budget.js'
import { strictJsonSchema } from '../strict-json-schema.js'
import { baseUrlOf } from '../base-url-of.js'
import type { ProviderSpec } from '../provider-spec.js'
import { chatCompletionsText } from './chat-completions-text.js'
import { openaiModels } from './openai-models.js'

const headers = (apiKey: string | undefined): Readonly<Record<string, string>> => ({
  'content-type': 'application/json',
  authorization: `Bearer ${apiKey ?? ''}`,
})

/**
 * OpenAI Chat Completions. `max_completion_tokens` replaced `max_tokens`, and the
 * schema must set `additionalProperties: false` on every object for strict mode.
 */
const DEFAULT_BASE_URL = 'https://api.openai.com'

export const openaiSpec: ProviderSpec = {
  id: 'openai',
  defaultBaseUrl: DEFAULT_BASE_URL,
  translateRequest: (config, request) => {
    const prompt = buildPrompt(request)
    return {
      url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1/chat/completions`,
      method: 'POST',
      headers: headers(config.apiKey),
      body: JSON.stringify({
        model: config.model,
        max_completion_tokens: outputBudget(request, 64000),
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'translations', strict: true, schema: strictJsonSchema },
        },
      }),
    }
  },
  extractText: chatCompletionsText,
  modelsRequest: (config) => ({
    url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1/models`,
    method: 'GET',
    headers: headers(config.apiKey),
    body: undefined,
  }),
  extractModels: openaiModels,
}
