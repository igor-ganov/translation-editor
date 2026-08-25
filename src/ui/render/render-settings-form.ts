import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { Settings } from '../../ports/settings-port.js'
import type { ProviderId } from '../../ports/provider-port.js'
import type { LanguageTag } from '../../core/document/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { renderSettingsActions } from './render-settings-actions.js'
import { onProviderChange } from '../element/on-provider-change.js'
import { renderProviderFields } from './render-provider-fields.js'
import { whenPresent } from './when-present.js'

const PROVIDERS: readonly ProviderId[] = ['anthropic', 'openai', 'gemini', 'ollama', 'llamacpp']
const LANGUAGES: readonly LanguageTag[] = ['en', 'ru', 'it']

const options = (values: readonly string[], selected: string) =>
  values.map((value) => html`<option value=${value} ?selected=${value === selected}>${value}</option>`)

const form = (
  host: HTMLElement,
  settings: Settings,
  secure: boolean,
  providerId: ProviderId,
  choose: (next: ProviderId) => void,
) => html`
  <h1>Settings</h1>
  ${whenPresent(
    !secure,
    () => html`<p class="warning">
      Running in a browser: the API key is kept in local storage, which other pages on this origin can read.
      Use the installed app for anything sensitive.
    </p>`,
  )}
  <label>Provider
    <select name="providerId" @change=${onProviderChange(choose)}>${options(PROVIDERS, providerId)}</select>
  </label>
  <label>Model
    <input name="model" .value=${settings.model} />
  </label>
  ${renderProviderFields(providerId, settings)}
  <label>Translate from
    <select name="from">${options(LANGUAGES, settings.defaultLanguages.from)}</select>
  </label>
  <label>Translate into
    <select name="to">${options(LANGUAGES, settings.defaultLanguages.to)}</select>
  </label>
  ${renderSettingsActions(host)}
`

/** The settings form, or nothing until settings have loaded. */
export const renderSettingsForm = (
  host: HTMLElement,
  settings: Settings | undefined,
  secure: boolean,
  providerId: ProviderId | undefined,
  choose: (next: ProviderId) => void,
) =>
  pipe(
    fromUndefined(settings),
    Option.map((present) => form(host, present, secure, providerId ?? present.providerId, choose)),
    Option.getOrElse(() => nothing),
  )
