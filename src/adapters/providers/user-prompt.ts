import type { TranslateRequest } from '../../ports/provider-port.js'

/** Neighbouring source text is supplied so pronouns and gender resolve correctly. */
export const userPrompt = (request: TranslateRequest): string =>
  [
    `Context (do not translate):\n${request.context}`,
    '',
    'Segments to translate:',
    ...request.segments.map((segment) => `[${segment.id}] ${segment.text}`),
  ].join('\n')
