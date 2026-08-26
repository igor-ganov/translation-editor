import { html } from 'lit'
import type { SettingsView } from './settings-view.js'
import { renderLanguagePair } from './render-language-pair.js'
import { renderSettingsActions } from './render-settings-actions.js'
import { renderSettingsService } from './render-settings-service.js'
import { renderSettingsSpine } from './render-settings-spine.js'
import { whenPresent } from './when-present.js'

const browserWarning = () => html`
  <p class="warning">
    Running in a browser, the key is kept in local storage, which other pages on this origin can read. Use the
    installed app for a key that can be billed.
  </p>
`

/** The whole settings page: who translates, with what credentials, and between which languages. */
export const renderSettingsForm = (host: HTMLElement, view: SettingsView) => html`
  ${renderSettingsSpine(host)}
  <main class="page colophon">
    <h1>Settings</h1>
    <p class="aside">
      Your key, your account, your bill. It is kept in this app's private storage and goes nowhere except to the
      service you pick.
    </p>
    ${whenPresent(!view.secure, browserWarning)} ${renderSettingsService(host, view)}
    ${renderLanguagePair(view.settings)} ${renderSettingsActions(host)}
  </main>
`
