import { html } from 'lit'
import type { SegmentFilter } from '../../core/view/types.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const FILTERS: readonly (readonly [SegmentFilter, string])[] = [
  ['all', 'Everything'],
  ['untranslated', 'Not translated'],
  ['unapproved', 'Not approved'],
  ['failed', 'Failed'],
]

const choose = (host: HTMLElement, filter: SegmentFilter) => () => {
  emit(host, editorEvents.filterChange, { filter })
}

/** Filters write nothing, so they are plain words rather than controls. */
export const renderDeskRead = (host: HTMLElement, current: SegmentFilter) => html`
  <section class="group">
    <h2>Read</h2>
    <p class="group__what">Changes what is on the page. Nothing is written.</p>
    <menu class="acts">
      ${FILTERS.map(
        ([value, label]) => html`
          <li>
            <button
              type="button"
              class="act act--quiet"
              aria-pressed=${value === current}
              @click=${choose(host, value)}
            >
              ${label}
            </button>
          </li>
        `,
      )}
    </menu>
  </section>
`
