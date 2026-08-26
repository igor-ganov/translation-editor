import { html } from 'lit'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const back = (host: HTMLElement) => () => {
  emit(host, editorEvents.openPage, {})
}

/** The way back to the page you were reading, which is the only way off the desk. */
export const renderDeskSpine = (host: HTMLElement, title: string) => html`
  <header class="spine">
    <button type="button" class="act act--quiet" @click=${back(host)}>Back to the page</button>
    <span class="spine__work">${title}</span>
  </header>
`
