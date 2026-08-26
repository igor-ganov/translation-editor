import { html } from 'lit'
import type { Project } from '../../core/project/types.js'
import type { Page } from '../../core/view/paginate.js'
import { pageSummary } from '../../core/view/page-summary.js'
import { pageStateWords } from '../page-state-words.js'
import { emit } from '../element/emit.js'
import { editorEvents } from '../element/editor-events.js'

const turnTo = (host: HTMLElement, page: number) => () => {
  emit(host, editorEvents.goToPage, { page })
}

/** Indexed by `Number(here)`, so marking the current page needs no branch. */
const CURRENT: readonly (string | undefined)[] = [undefined, 'page']

/** One line of the contents: title, leader, what is left, folio. */
export const renderContentsLine =
  (host: HTMLElement, project: Project, here: number) =>
  (page: Page, index: number) => {
    const summary = pageSummary(project)(page)
    return html`
      <li aria-current=${CURRENT[Number(index === here)] ?? 'false'}>
        <button type="button" class="contents__row" @click=${turnTo(host, index)}>
          <span class="contents__title">${summary.title}</span>
          <span class="contents__lead"></span>
          <span class="contents__state">${pageStateWords(summary)}</span>
          <span class="contents__folio">${String(index + 1)}</span>
        </button>
      </li>
    `
  }
