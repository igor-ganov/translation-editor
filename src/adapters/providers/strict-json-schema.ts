/**
 * The reply contract in strict JSON Schema form, which OpenAI and llama.cpp
 * require: every object must declare `additionalProperties: false`.
 */
export const strictJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['segments'],
  properties: {
    segments: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'text'],
        properties: { id: { type: 'string' }, text: { type: 'string' } },
      },
    },
  },
} as const
