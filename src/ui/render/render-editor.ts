import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { Project } from '../../core/project/types.js'
import type { SegmentFilter } from '../../core/view/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { editorRows } from '../../core/view/editor-rows.js'
import { paginate } from '../../core/view/paginate.js'
import { clampPage } from '../../core/view/clamp-page.js'
import { renderSpine } from './render-spine.js'
import { renderTurner } from './render-turner.js'
import { renderRow } from './render-row.js'
import { whenPresent } from './when-present.js'

export type EditorProps = {
  readonly project: Project | undefined
  readonly filter: SegmentFilter
  readonly page: number
  readonly collapsed: ReadonlySet<string>
}

const view = (host: HTMLElement, project: Project, props: EditorProps) => {
  const pages = paginate(editorRows(project)(props.filter, props.collapsed))
  const here = clampPage(pages.length)(props.page)
  return html`
    ${renderSpine(host, project.name, here, pages.length)}
    <main class="page" role="list">
      ${whenPresent(pages.length === 0, () => html`<p class="empty">Nothing here matches what you asked to see.</p>`)}
      ${(pages[here] ?? []).map(renderRow)}
    </main>
    ${renderTurner(host, here, pages.length)}
  `
}

/** One page of the document, or nothing until a document is open. */
export const renderEditor = (host: HTMLElement, props: EditorProps) =>
  pipe(
    fromUndefined(props.project),
    Option.map((project) => view(host, project, props)),
    Option.getOrElse(() => nothing),
  )
