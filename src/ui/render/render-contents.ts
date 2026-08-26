import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { Project } from '../../core/project/types.js'
import type { ContentsView } from './contents-view.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { editorRows } from '../../core/view/editor-rows.js'
import { paginate } from '../../core/view/paginate.js'
import { clampPage } from '../../core/view/clamp-page.js'
import { renderDeskSpine } from './render-desk-spine.js'
import { renderContentsLine } from './render-contents-line.js'

const view = (host: HTMLElement, project: Project, props: ContentsView) => {
  const pages = paginate(editorRows(project)(props.filter, props.collapsed))
  const here = clampPage(pages.length)(props.page)
  return html`
    ${renderDeskSpine(host, project.name)}
    <main class="page">
      <h1>Where you are, and where the work is</h1>
      <p class="aside">
        A page holds about a screenful. Nothing is hidden behind a scroll: if a page is not
        finished, it says so here.
      </p>
      <ol class="contents">
        ${pages.map(renderContentsLine(host, project, here))}
      </ol>
    </main>
  `
}

/** The contents, or nothing until a document is open. */
export const renderContents = (host: HTMLElement, props: ContentsView) =>
  pipe(
    fromUndefined(props.project),
    Option.map((project) => view(host, project, props)),
    Option.getOrElse(() => nothing),
  )
