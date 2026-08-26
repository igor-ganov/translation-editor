import { html } from 'lit'
import type { LanguagePair } from '../../core/project/types.js'
import { plural } from '../../app/controller/plural.js'
import { languageName } from '../language-name.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/** Indexed by `Number(translating)`, so the choice of control needs no branch. */
const CONTROLS: readonly ((host: HTMLElement, outstanding: number) => unknown)[] = [
  (host, outstanding) => html`
    <button type="button" class="act act--commit" ?disabled=${outstanding === 0} @click=${send(host, editorEvents.translate)}>
      Translate ${plural(outstanding, 'sentence', 'sentences')}
    </button>
  `,
  (host) => html`<button type="button" class="act" @click=${send(host, editorEvents.cancelTranslate)}>Stop</button>`,
]

/** The only control on the desk that spends anything, and it says what it will do. */
export const renderDeskTranslate = (
  host: HTMLElement,
  outstanding: number,
  translating: boolean,
  model: string,
  languages: LanguagePair,
) => html`
  <section class="group">
    <h2>Translate</h2>
    <p class="group__what">
      Reads this document as ${languageName(languages.from)} and writes ${languageName(languages.to)}, using
      ${model}. Nothing you wrote or settled yourself is touched.
    </p>
    <menu class="acts">
      <li>${(CONTROLS[Number(translating)] ?? CONTROLS[0])?.(host, outstanding)}</li>
    </menu>
  </section>
`
