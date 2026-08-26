import { html } from 'lit'
import type { LanguageTag } from '../../core/document/types.js'
import type { Settings } from '../../ports/settings-port.js'
import { languageLabel } from './language-label.js'
import { renderOptions } from './render-options.js'

const LANGUAGES: readonly LanguageTag[] = ['en', 'ru', 'it']

/**
 * Set as the sentence it is, so the direction cannot be misread. Reversing the
 * pair is the commonest and most expensive mistake on this screen.
 */
export const renderLanguagePair = (settings: Settings) => html`
  <section>
    <h2>Languages</h2>
    <p class="aside">Used for new documents. An open document keeps the pair it was made with.</p>
    <p class="pair">
      <label class="field">
        <span class="field__name">From</span>
        <span class="field__box">
          <select name="from">${renderOptions(LANGUAGES, languageLabel, settings.defaultLanguages.from)}</select>
        </span>
      </label>
      <span class="pair__into">into</span>
      <label class="field">
        <span class="field__name">To</span>
        <span class="field__box">
          <select name="to">${renderOptions(LANGUAGES, languageLabel, settings.defaultLanguages.to)}</select>
        </span>
      </label>
    </p>
  </section>
`
