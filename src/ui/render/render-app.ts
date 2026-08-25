import { Option } from 'effect'
import { html } from 'lit'
import type { AppState } from '../store/app-state.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import '../te-projects.js'
import '../te-editor.js'
import '../te-settings.js'

const VIEWS: Record<AppState['route'], (state: AppState) => unknown> = {
  projects: (state) => html`<te-projects .projects=${state.projects}></te-projects>`,
  settings: (state) => html`<te-settings .settings=${state.settings} ?secure=${state.secureCredentials}></te-settings>`,
  editor: (state) => html`
    <te-editor
      .project=${Option.getOrUndefined(state.project)}
      .filter=${state.filter}
      .collapsed=${state.collapsed}
      ?translating=${state.busy.tag === 'translating'}
      .undoLabel=${state.undo[0]?.label ?? ''}
      .revealSegment=${Option.getOrUndefined(Option.flatMap(state.project, (project) => fromUndefined(project.cursor)))}
    ></te-editor>
  `,
}

/** Chooses the screen. Exhaustive over the route union by construction. */
export const renderApp = (state: AppState) => VIEWS[state.route](state)
