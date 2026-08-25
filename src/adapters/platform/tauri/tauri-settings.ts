import { Effect, Option, Schema } from 'effect'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { fromUndefined } from '../../../core/option/from-undefined.js'
import type { Settings, SettingsPort } from '../../../ports/settings-port.js'
import { settingsSchema } from '../../../core/settings/settings-schema.js'

const FILE = 'settings.json'
const KEY = 'settings'

const read = async (): Promise<Option.Option<Settings>> => {
  const store = await loadStore(FILE, { autoSave: true })
  const raw = await store.get(KEY)
  return Option.flatMap(fromUndefined(raw), (value) =>
    Option.getRight(Schema.decodeUnknownEither(settingsSchema)(value)),
  )
}

/**
 * The Tauri store writes to the app's private data directory, which is why this
 * is the only place credentials are considered safe to keep.
 */
export const tauriSettings = (): SettingsPort => ({
  secureCredentials: true,
  load: () => Effect.orElseSucceed(Effect.tryPromise(read), () => Option.none<Settings>()),
  save: (settings) =>
    Effect.ignore(
      Effect.tryPromise(async () => {
        const store = await loadStore(FILE, { autoSave: true })
        await store.set(KEY, settings)
        await store.save()
      }),
    ),
})
