import type { Effect, Option } from 'effect'
import type { LanguageTag, ProjectId } from '../core/document/types.js'
import type { ProviderId } from './provider-port.js'

export type Settings = {
  readonly providerId: ProviderId
  readonly model: string
  readonly baseUrl: string | undefined
  /**
   * Held only in the platform's private application storage, never exported.
   * Written with an explicit `| undefined` so a decoded record — where every key
   * is optional — is assignable without loosening `exactOptionalPropertyTypes`.
   */
  readonly apiKeys: { readonly [K in ProviderId]?: string | undefined }
  readonly defaultLanguages: { readonly from: LanguageTag; readonly to: LanguageTag }
  readonly batchTokens: number
  /** The document to reopen on launch, so the app comes back where it was left. */
  readonly lastProjectId: ProjectId | undefined
}

export type SettingsPort = {
  readonly load: () => Effect.Effect<Option.Option<Settings>>
  readonly save: (settings: Settings) => Effect.Effect<void>
  /** False in the browser build, where storage is not private to the app. */
  readonly secureCredentials: boolean
}
