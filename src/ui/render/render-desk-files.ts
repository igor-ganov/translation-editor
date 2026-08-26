import { html } from 'lit'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/** Writing a file out, and reading one back in. Both leave the document intact. */
export const renderDeskFiles = (host: HTMLElement) => html`
  <section class="group">
    <h2>Export</h2>
    <p class="group__what">Writes a file. The document here is unchanged.</p>
    <menu class="acts">
      <li><button type="button" class="act" @click=${send(host, editorEvents.exportDocx)}>Word document</button></li>
      <li><button type="button" class="act" @click=${send(host, editorEvents.exportMarkup)}>Marked-up text</button></li>
    </menu>
  </section>

  <section class="group">
    <h2>Import</h2>
    <p class="group__what">You will see exactly what changes before anything is written.</p>
    <menu class="acts">
      <li>
        <button type="button" class="act" @click=${send(host, editorEvents.importMarkup)}>
          Bring a translation back
        </button>
      </li>
    </menu>
  </section>
`
