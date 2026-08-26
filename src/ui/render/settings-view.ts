import type { ProviderId } from '../../ports/provider-port.js'
import type { Settings } from '../../ports/settings-port.js'
import type { SettingsVerdict } from './render-verdict.js'

/** Everything the settings screen draws from, resolved into one piece. */
export type SettingsView = {
  readonly settings: Settings
  /** False in the browser build, where the key does not have private storage. */
  readonly secure: boolean
  /** The service being edited, which differs from the saved one until Save. */
  readonly providerId: ProviderId
  readonly verdict: SettingsVerdict | undefined
  readonly choose: (next: ProviderId) => void
}
