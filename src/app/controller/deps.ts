import type { Store } from '../../ui/store/create-store.js'
import type { AppState } from '../../ui/store/app-state.js'
import type { Platform } from '../platform.js'

export type Deps = {
  readonly platform: Platform
  readonly store: Store<AppState>
}
