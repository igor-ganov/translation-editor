import { html } from 'lit'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const turn = (host: HTMLElement, by: number) => () => {
  emit(host, editorEvents.turnPage, { by })
}

/**
 * The page turner, fixed where a thumb already rests.
 *
 * The two arrows are the largest targets on screen and they are the only thing
 * competing with the text for attention. Turning past the last page stays on it:
 * a book does not wrap, and neither should this.
 */
export const renderTurner = (host: HTMLElement, page: number, count: number) => html`
  <nav class="turner" aria-label="Pages">
    <button type="button" class="act" ?disabled=${page <= 0} @click=${turn(host, -1)} aria-label="Previous page">
      ←
    </button>
    <span class="turner__folio"><b>${String(page + 1)}</b> / ${String(Math.max(1, count))}</span>
    <button
      type="button"
      class="act"
      ?disabled=${page >= count - 1}
      @click=${turn(host, 1)}
      aria-label="Next page"
    >
      →
    </button>
  </nav>
`
