import { Effect, Option } from 'effect'
import type { LanguageTag } from '../../../core/document/types.js'
import type { ProviderId } from '../../../ports/provider-port.js'
import type { Settings } from '../../../ports/settings-port.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

const PROVIDERS: Readonly<Record<string, ProviderId>> = {
  anthropic: 'anthropic', openai: 'openai', gemini: 'gemini', ollama: 'ollama', llamacpp: 'llamacpp',
}
const LANGUAGES: Readonly<Record<string, LanguageTag>> = { en: 'en', ru: 'ru', it: 'it' }

/** An empty field means "not set", not an empty key. */
const blankToUndefined = (value: string): string | undefined =>
  Option.getOrUndefined(Option.liftPredicate((text: string) => text.length > 0)(value.trim()))

const merge = (current: Settings, form: Readonly<Record<string, string>>): Settings => {
  const providerId = PROVIDERS[form['providerId'] ?? ''] ?? current.providerId
  return {
    ...current,
    providerId,
    model: form['model'] ?? current.model,
    baseUrl: blankToUndefined(form['baseUrl'] ?? ''),
    apiKeys: { ...current.apiKeys, [providerId]: blankToUndefined(form['apiKey'] ?? '') },
    defaultLanguages: {
      from: LANGUAGES[form['from'] ?? ''] ?? current.defaultLanguages.from,
      to: LANGUAGES[form['to'] ?? ''] ?? current.defaultLanguages.to,
    },
  }
}

/** Stores settings, keeping the key under the provider it belongs to. */
export const handleSaveSettings =
  (deps: Deps) =>
  (form: Readonly<Record<string, string>>): void => {
    const settings = merge(deps.store.get().settings, form)
    deps.store.update((state) => ({ ...state, settings }))
    void Effect.runPromise(deps.platform.settings.save(settings))
    setNotice(deps)({ tag: 'info', text: 'Settings saved.' })
  }
