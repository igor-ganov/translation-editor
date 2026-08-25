import type { Store } from '../../ui/store/create-store.js'
import type { AppState } from '../../ui/store/app-state.js'
import type { Platform } from '../platform.js'
import type { Logger } from '../create-logger.js'

export type Deps = {
  readonly platform: Platform
  readonly store: Store<AppState>
  /** Records what happened, so a failure on a device can be read rather than described. */
  readonly logger: Logger
}
