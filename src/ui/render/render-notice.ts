import { html, nothing } from 'lit'
import type { Notice } from '../store/app-state.js'

/**
 * Messages are announced politely rather than interrupting, and they are text in
 * the page rather than a native dialog — a modal blocks the whole webview under
 * Tauri and takes the app with it.
 */
export const renderNotice = (notice: Notice) => {
  switch (notice.tag) {
    case 'none':
      return nothing
    case 'info':
      return html`<p class="notice" role="status">${notice.text}</p>`
    case 'error':
      return html`<p class="notice error" role="alert">${notice.text}</p>`
  }
}
