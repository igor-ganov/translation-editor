import { html } from 'lit'
import { emit } from '../element/emit.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/** Applying is the one thing on this screen that writes, so it is the filled one. */
export const renderImportActs = (host: HTMLElement) => html`
  <menu class="acts">
    <li>
      <button type="button" class="act act--commit" @click=${send(host, 'te-confirm-import')}>
        Bring it in
      </button>
    </li>
    <li>
      <button type="button" class="act act--quiet" @click=${send(host, 'te-cancel-import')}>
        Leave things as they are
      </button>
    </li>
  </menu>
`
