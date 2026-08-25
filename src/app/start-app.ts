import type { AppState } from '../ui/store/app-state.js'
import { bootstrap } from './bootstrap.js'
import { attachListeners } from './controller/attach-listeners.js'
import { captureFailures } from './capture-failures.js'

/**
 * Starts the application against a host element and reports every state change.
 * Returns the unsubscribe function so the shell can detach cleanly.
 */
export const startApp = async (
  host: HTMLElement,
  onChange: (state: AppState) => void,
): Promise<() => void> => {
  const deps = await bootstrap()
  captureFailures(deps.logger)
  attachListeners(deps)(host)
  onChange(deps.store.get())
  // The readiness marker: on Android this reaches logcat, which is how both a
  // person with a phone and CI can tell that the frontend actually ran rather
  // than leaving a live process behind a blank window.
  deps.logger.record('info', 'startup', 'shell ready', { route: deps.store.get().route })
  return deps.store.subscribe(onChange)
}
