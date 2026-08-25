import type { TranslateRequest } from '../../ports/provider-port.js'
import { systemPrompt } from './system-prompt.js'
import { userPrompt } from './user-prompt.js'

export type Prompt = { readonly system: string; readonly user: string }

/** The provider-neutral prompt pair; each adapter places these where its API wants them. */
export const buildPrompt = (request: TranslateRequest): Prompt => ({
  system: systemPrompt(request.from, request.to),
  user: userPrompt(request),
})
