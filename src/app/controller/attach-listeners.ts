import { attachSegmentListeners } from './attach-segment-listeners.js'
import { attachEditorListeners } from './attach-editor-listeners.js'
import { attachProjectListeners } from './attach-project-listeners.js'
import type { Deps } from './deps.js'

/**
 * Wires every component event to its handler. This is the only place the UI and
 * the domain meet, so a new action is one listener here and one pure function.
 */
export const attachListeners =
  (deps: Deps) =>
  (host: HTMLElement): void => {
    attachSegmentListeners(deps)(host)
    attachEditorListeners(deps)(host)
    attachProjectListeners(deps)(host)
  }
