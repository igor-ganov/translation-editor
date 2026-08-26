import { Option } from 'effect'
import { html } from 'lit'
import type { LanguagePair } from '../../core/project/types.js'
import type { LanguageTag } from '../../core/document/types.js'
import { languageName } from '../language-name.js'
import { selectOf } from '../element/select-of.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const TAGS: readonly LanguageTag[] = ['en', 'ru', 'it']

const change = (host: HTMLElement, pair: LanguagePair, side: 'from' | 'to') => (event: Event) => {
  for (const select of Option.toArray(selectOf(event))) {
    emit(host, editorEvents.setLanguages, { ...pair, [side]: select.value })
  }
}

const chooser = (host: HTMLElement, pair: LanguagePair, side: 'from' | 'to', label: string) => html`
  <label class="field">
    <span class="field__name">${label}</span>
    <span class="field__box">
      <select @change=${change(host, pair, side)}>
        ${TAGS.map((tag) => html`<option value=${tag} ?selected=${tag === pair[side]}>${languageName(tag)}</option>`)}
      </select>
    </span>
  </label>
`

/** The pair this document is translated under, which used to be unchangeable. */
export const renderDeskLanguages = (host: HTMLElement, pair: LanguagePair) => html`
  <section class="group">
    <h2>Languages</h2>
    <p class="group__what">
      Fixed when the document was imported, and now changeable. Sentences already translated stay
      as they are; so do any sentence breaks you moved yourself.
    </p>
    ${chooser(host, pair, 'from', 'This document is written in')}
    ${chooser(host, pair, 'to', 'Translate it into')}
  </section>
`
