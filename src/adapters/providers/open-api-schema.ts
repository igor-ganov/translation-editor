/**
 * The same reply contract in the OpenAPI subset Gemini accepts. It rejects
 * `additionalProperties`, so the contract is stated twice rather than shared as
 * one blob that neither provider would take.
 */
export const openApiSchema = {
  type: 'object',
  required: ['segments'],
  properties: {
    segments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'text'],
        properties: { id: { type: 'string' }, text: { type: 'string' } },
      },
    },
  },
} as const
