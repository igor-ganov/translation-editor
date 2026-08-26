import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { Project } from '../../core/project/types.js'
import type { DeskView } from './desk-view.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { projectProgress } from '../../core/approval/project-progress.js'
import { selectUntranslated } from '../../core/translation/select-untranslated.js'
import { renderThread } from './render-thread.js'
import { renderDeskSpine } from './render-desk-spine.js'
import { renderDeskRead } from './render-desk-read.js'
import { renderDeskTranslate } from './render-desk-translate.js'
import { renderDeskLanguages } from './render-desk-languages.js'
import { renderDeskFiles } from './render-desk-files.js'
import { renderDeskKeeping } from './render-desk-keeping.js'

const view = (host: HTMLElement, project: Project, props: DeskView) => html`
  ${renderDeskSpine(host, project.name)}
  <main class="page">
    <h1>Everything you can do to this document</h1>
    ${renderThread(projectProgress(project))}
    <div class="desk">
      ${renderDeskRead(host, props.filter)}
      ${renderDeskTranslate(
        host,
        selectUntranslated(project).length,
        props.translating,
        props.model,
        project.languages,
      )}
      ${renderDeskLanguages(host, project.languages)} ${renderDeskFiles(host)}
      ${renderDeskKeeping(host, props.undoLabel)}
    </div>
  </main>
`

/** The desk, or nothing until a document is open. */
export const renderDesk = (host: HTMLElement, props: DeskView) =>
  pipe(
    fromUndefined(props.project),
    Option.map((project) => view(host, project, props)),
    Option.getOrElse(() => nothing),
  )
