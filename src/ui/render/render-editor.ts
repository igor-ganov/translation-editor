import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import '@lit-labs/virtualizer'
import type { Project } from '../../core/project/types.js'
import type { SegmentFilter } from '../../core/view/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { editorRows } from '../../core/view/editor-rows.js'
import { projectProgress } from '../../core/approval/project-progress.js'
import { renderProgress } from './render-progress.js'
import { renderEditorActions } from './render-editor-actions.js'
import { renderRow } from './render-row.js'
import { whenPresent } from './when-present.js'
import { onScroll } from '../element/on-scroll.js'

export type EditorProps = {
  readonly project: Project | undefined
  readonly filter: SegmentFilter
  readonly collapsed: ReadonlySet<string>
  readonly translating: boolean
  /** Empty when there is nothing to undo, which hides the control. */
  readonly undoLabel: string
}

const view = (host: HTMLElement, project: Project, props: EditorProps) => {
  const rows = editorRows(project)(props.filter, props.collapsed)
  return html`
    <header>
      ${renderProgress(projectProgress(project))}
      ${renderEditorActions(host, props.filter, props.translating, props.undoLabel)}
    </header>
    <div class="list" role="list" @scroll=${onScroll(host, rows)}>
      ${whenPresent(rows.length === 0, () => html`<p class="empty">Nothing matches this filter.</p>`)}
      <lit-virtualizer .items=${rows} .renderItem=${renderRow} .keyFunction=${(row: { id: string }) => row.id}>
      </lit-virtualizer>
    </div>
  `
}

/** The editor, or nothing until a project is open. */
export const renderEditor = (host: HTMLElement, props: EditorProps) =>
  pipe(
    fromUndefined(props.project),
    Option.map((project) => view(host, project, props)),
    Option.getOrElse(() => nothing),
  )
