import { Option } from 'effect'
import type { ProviderId } from '../../ports/provider-port.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { selectOf } from './select-of.js'

const PROVIDERS: Readonly<Record<string, ProviderId>> = {
  anthropic: 'anthropic',
  openai: 'openai',
  gemini: 'gemini',
  ollama: 'ollama',
  llamacpp: 'llamacpp',
}

/**
 * Re-renders the form for the newly chosen provider, so only the fields that
 * provider actually uses are on screen.
 */
export const onProviderChange =
  (choose: (providerId: ProviderId) => void) =>
  (event: Event): void => {
    for (const select of Option.toArray(selectOf(event))) {
      for (const providerId of Option.toArray(fromUndefined(PROVIDERS[select.value]))) {
        choose(providerId)
      }
    }
  }
