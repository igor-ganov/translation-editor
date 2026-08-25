import { estimateOutputTokens } from '../../core/translation/estimate-output-tokens.js'
import type { TranslateRequest } from '../../ports/provider-port.js'

/**
 * The reply size to ask a provider for.
 *
 * Never a fixed constant. A constant is either far below what the batch needs —
 * which truncates the reply and fails every segment in it — or far below what
 * the model could give, which forces batches to be smaller than they need to be.
 * A floor keeps small batches from asking for an absurdly tight budget.
 */
export const outputBudget = (request: TranslateRequest, ceiling: number): number =>
  Math.min(ceiling, Math.max(4096, estimateOutputTokens(request.segments)))
