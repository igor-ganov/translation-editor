import { html } from 'lit'
import { whenPresent } from './when-present.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/**
 * What to do about a message.
 *
 * Saving the record sits on the failure itself. It was on the desk, several
 * screens' worth of scrolling away from the thing it explains, which in practice
 * meant that at the moment someone wanted the log there was no way to reach it.
 */
export const renderNoticeActs = (host: HTMLElement, failed: boolean) => html`
  <span class="notice__acts">
    ${whenPresent(
      failed,
      () => html`
        <button
          class="notice__act"
          type="button"
          title="Write a diagnostic record to a file you can send on"
          @click=${send(host, editorEvents.exportLog)}
        >
          Save the record
        </button>
      `,
    )}
    <button
      class="notice__act notice__close"
      type="button"
      aria-label="Dismiss this message"
      @click=${send(host, editorEvents.dismissNotice)}
    >
      Dismiss
    </button>
  </span>
`
