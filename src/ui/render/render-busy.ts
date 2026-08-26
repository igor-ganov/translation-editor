import { html, nothing } from 'lit'
import type { Busy } from '../store/app-state.js'

/** A live region so progress is announced without stealing focus. */
export const renderBusy = (busy: Busy) => {
  switch (busy.tag) {
    case 'idle':
      return nothing
    case 'working':
      return html`<p class="working" role="status">${busy.label}…</p>`
    case 'translating':
      return html`<p class="working" role="status">
        Translating: ${String(busy.done)} of ${String(busy.total)} sentences done.
      </p>`
  }
}
