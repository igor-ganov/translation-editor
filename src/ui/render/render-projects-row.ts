import { Option } from 'effect'
import { html, nothing } from 'lit'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { emit } from '../element/emit.js'
import { projectEvents } from '../element/project-events.js'
import { renderProjectsThread } from './render-projects-thread.js'
import { renderProjectsWhen } from './render-projects-when.js'
import type { ShelfEntry } from './render-projects-shelf.js'

/* Drawn only for entries that arrive with counts. A shelf cannot open every
   document to measure it, so a missing thread means unknown, never zero. */
const thread = (entry: ShelfEntry) =>
  Option.match(fromUndefined(entry.progress), {
    onNone: () => nothing,
    onSome: renderProjectsThread,
  })

/** One document: a spine you read along, with what it costs to remove it beside it. */
export const renderProjectsRow = (host: HTMLElement, entry: ShelfEntry) => html`
  <li>
    <button
      class="shelf__row"
      type="button"
      @click=${() => {
        emit(host, projectEvents.open, { id: entry.id })
      }}
    >
      <span class="shelf__spine">
        <span class="shelf__title">${entry.name}</span>
        ${thread(entry)}
      </span>
      <span class="shelf__meta">${renderProjectsWhen(entry.updatedAt, Date.now())}</span>
    </button>
    <button
      class="act act--quiet act--undo shelf__remove"
      type="button"
      aria-label=${`Remove ${entry.name}`}
      @click=${() => {
        emit(host, projectEvents.remove, { id: entry.id })
      }}
    >
      Remove
    </button>
  </li>
`
