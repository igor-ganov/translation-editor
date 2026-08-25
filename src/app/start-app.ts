import type { AppState } from '../ui/store/app-state.js'
import { bootstrap } from './bootstrap.js'
import { attachListeners } from './controller/attach-listeners.js'

/**
 * Starts the application against a host element and reports every state change.
 * Returns the unsubscribe function so the shell can detach cleanly.
 */
export const startApp = async (
  host: HTMLElement,
  onChange: (state: AppState) => void,
): Promise<() => void> => {
  const deps = await bootstrap()
  attachListeners(deps)(host)
  onChange(deps.store.get())
  return deps.store.subscribe(onChange)
}
