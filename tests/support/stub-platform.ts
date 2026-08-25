import { Effect, Option } from 'effect'
import type { Platform } from '../../src/app/platform.js'
import type { HttpPort, HttpResponse } from '../../src/ports/http-port.js'
import type { Project } from '../../src/core/project/types.js'
import type { Settings } from '../../src/ports/settings-port.js'
import { defaultSettings } from '../../src/core/settings/default-settings.js'

export type StubPlatform = Platform & {
  readonly saved: Project[]
  readonly settingsWritten: Settings[]
}

/** A platform whose ports record what they were asked to do and never touch a device. */
export const stubPlatform = (http: HttpPort): StubPlatform => {
  const saved: Project[] = []
  const settingsWritten: Settings[] = []
  return {
    http,
    saved,
    settingsWritten,
    native: false,
    restoresWindowGeometry: false,
    file: {
      open: () => Effect.succeed(Option.none()),
      save: () => Effect.succeed(true),
    },
    settings: {
      secureCredentials: true,
      load: () => Effect.succeed(Option.some(defaultSettings)),
      save: (settings) =>
        Effect.sync(() => {
          settingsWritten.push(settings)
        }),
    },
    storage: {
      listProjects: () => Effect.succeed([]),
      loadProject: () => Effect.succeed(Option.none()),
      saveProject: (project) =>
        Effect.sync(() => {
          saved.push(project)
        }),
      saveEntry: () => () => Effect.void,
      saveCursor: () => () => Effect.void,
      deleteProject: () => Effect.void,
      saveOriginal: () => () => Effect.void,
      loadOriginal: () => Effect.succeed(Option.none()),
    },
  }
}

export const okResponse = (payload: unknown): HttpResponse => ({ status: 200, body: JSON.stringify(payload) })
