import { html } from 'lit'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/**
 * Where you are, and the two ways out of it.
 *
 * Everything the document can be done to lives behind "Desk", and everywhere it
 * can be turned to lives behind the folio. Two words carry what was a row of
 * eleven identical buttons, and neither of them hides behind a symbol.
 */
export const renderSpine = (host: HTMLElement, title: string, page: number, count: number) => html`
  <header class="spine">
    <button type="button" class="act act--quiet" @click=${send(host, editorEvents.openDesk)}>Desk</button>
    <span class="spine__work">${title}</span>
    <button
      type="button"
      class="act act--quiet spine__where"
      @click=${send(host, editorEvents.openContents)}
    >
      page ${String(page + 1)} of ${String(Math.max(1, count))}
    </button>
  </header>
`
