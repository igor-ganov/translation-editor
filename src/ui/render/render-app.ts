import { Option } from 'effect'
import { html } from 'lit'
import type { AppState } from '../store/app-state.js'
import '../te-projects.js'
import '../te-editor.js'
import '../te-desk.js'
import '../te-contents.js'
import '../te-settings.js'

const VIEWS: Record<AppState['route'], (state: AppState) => unknown> = {
  projects: (state) => html`<te-projects .projects=${state.projects}></te-projects>`,
  settings: (state) => html`
    <te-settings
      .settings=${state.settings}
      ?secure=${state.secureCredentials}
      ?hasDocument=${Option.isSome(state.project)}
    ></te-settings>
  `,
  desk: (state) => html`
    <te-desk
      .project=${Option.getOrUndefined(state.project)}
      .filter=${state.filter}
      .settings=${state.settings}
      ?translating=${state.busy.tag === 'translating'}
      .undoLabel=${state.undo[0]?.label ?? ''}
    ></te-desk>
  `,
  contents: (state) => html`
    <te-contents
      .project=${Option.getOrUndefined(state.project)}
      .filter=${state.filter}
      .collapsed=${state.collapsed}
      .page=${state.page}
    ></te-contents>
  `,
  editor: (state) => html`
    <te-editor
      .project=${Option.getOrUndefined(state.project)}
      .filter=${state.filter}
      .collapsed=${state.collapsed}
      .page=${state.page}
    ></te-editor>
  `,
}

/** Chooses the screen. Exhaustive over the route union by construction. */
export const renderApp = (state: AppState) => VIEWS[state.route](state)
