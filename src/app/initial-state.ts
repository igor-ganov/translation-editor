import { Option } from 'effect'
import type { AppState } from '../ui/store/app-state.js'
import { defaultSettings } from '../core/settings/default-settings.js'

/** The app starts on the document list with no provider configured and nothing open. */
export const initialState: AppState = {
  route: 'projects',
  projects: [],
  project: Option.none(),
  settings: defaultSettings,
  filter: 'all',
  collapsed: new Set(),
  busy: { tag: 'idle' },
  notice: { tag: 'none' },
  secureCredentials: true,
  pendingImport: Option.none(),
  undo: [],
}
