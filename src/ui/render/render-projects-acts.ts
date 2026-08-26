import { html } from 'lit'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'

const send = (host: HTMLElement, name: string) => () => {
  emit(host, name, {})
}

/**
 * Three commands, three weights. Opening a document is the only thing anyone came
 * here to do, so it is the filled one; settings and the log are outlines, because
 * both are occasional and neither touches the work.
 */
export const renderProjectsActs = (host: HTMLElement) => html`
  <menu class="acts">
    <li>
      <button class="act act--commit" type="button" @click=${send(host, projectEvents.importDocx)}>
        Open a document
      </button>
    </li>
    <li>
      <button class="act" type="button" @click=${send(host, projectEvents.openSettings)}>
        Settings
      </button>
    </li>
    <li>
      <button
        class="act"
        type="button"
        title="Write a diagnostic record to a file you can send on"
        @click=${send(host, 'te-export-log')}
      >
        Save the record
      </button>
    </li>
  </menu>
`
