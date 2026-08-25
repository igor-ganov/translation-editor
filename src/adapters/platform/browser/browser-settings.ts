import { Effect, Either, Option, pipe } from 'effect'
import type { Settings, SettingsPort } from '../../../ports/settings-port.js'
import { settingsSchema } from '../../../core/settings/settings-schema.js'
import { decodeRecord } from '../../storage/indexeddb/decode-record.js'

const KEY = 'translation-editor:settings'

/** Guarded because private-browsing modes make storage access throw outright. */
const stored = (): Option.Option<string> =>
  pipe(
    Either.try(() => localStorage.getItem(KEY) ?? ''),
    Option.getRight,
    Option.flatMap(Option.liftPredicate((value: string) => value.length > 0)),
  )

const read = (): Option.Option<Settings> =>
  pipe(
    stored(),
    Option.flatMap((raw) => Option.getRight(Either.try((): unknown => JSON.parse(raw)))),
    Option.flatMap(decodeRecord(settingsSchema)),
  )

/**
 * Browser fallback. `localStorage` is readable by anything running on the origin,
 * so credentials kept here are not private. `secureCredentials` is false, and the
 * settings screen says so rather than letting the user assume otherwise.
 */
export const browserSettings = (): SettingsPort => ({
  secureCredentials: false,
  load: () => Effect.sync(read),
  save: (settings) =>
    Effect.sync(() => {
      localStorage.setItem(KEY, JSON.stringify(settings))
    }),
})
