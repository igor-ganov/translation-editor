import { html, nothing } from 'lit'
import type { Notice } from '../store/app-state.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

/**
 * Messages are text in the page, never a native dialog — a modal blocks the whole
 * webview under Tauri and takes the app with it.
 *
 * A message gets room to be a message: it wraps, it does not clip, and it stays
 * until dismissed. The previous version was a one-line strip above a dense row of
 * controls, where a failure explaining itself in a sentence arrived cut in half.
 */
const message = (host: HTMLElement, kind: string, role: string, text: string) => html`
  <aside class="notice notice--${kind}" role=${role}>
    <p class="notice__text">${text}</p>
    <button
      class="notice__close"
      type="button"
      aria-label="Dismiss this message"
      @click=${() => {
        emit(host, editorEvents.dismissNotice, {})
      }}
    >
      Dismiss
    </button>
  </aside>
`

export const renderNotice = (host: HTMLElement, notice: Notice) => {
  switch (notice.tag) {
    case 'none':
      return nothing
    case 'info':
      return message(host, 'info', 'status', notice.text)
    case 'error':
      return message(host, 'error', 'alert', notice.text)
  }
}
