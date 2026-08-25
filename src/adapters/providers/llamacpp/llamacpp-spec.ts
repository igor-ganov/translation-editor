import { buildPrompt } from '../build-prompt.js'
import { strictJsonSchema } from '../strict-json-schema.js'
import { baseUrlOf } from '../base-url-of.js'
import type { ProviderSpec } from '../provider-spec.js'
import { chatCompletionsText } from '../openai/chat-completions-text.js'
import { openaiModels } from '../openai/openai-models.js'

const headers = (apiKey: string | undefined): Readonly<Record<string, string>> => ({
  'content-type': 'application/json',
  authorization: `Bearer ${apiKey ?? 'local'}`,
})

/**
 * A local `llama-server`. It speaks the OpenAI dialect but constrains output with
 * a GBNF grammar compiled from the schema, which is the hardest guarantee of the
 * five providers. The base URL is user-configurable because the port varies.
 */
const DEFAULT_BASE_URL = 'http://127.0.0.1:8080'

export const llamacppSpec: ProviderSpec = {
  id: 'llamacpp',
  defaultBaseUrl: DEFAULT_BASE_URL,
  translateRequest: (config, request) => {
    const prompt = buildPrompt(request)
    return {
      url: `${baseUrlOf(DEFAULT_BASE_URL, config)}/v1/chat/completions`,
      method: 'POST',
      headers: headers(config.apiKey),
      body: JSON.stringify({
        model: config.model,
        max_tokens: 8192,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        response_format: { type: 'json_schema', json_schema: { schema: strictJsonSchema } },
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
