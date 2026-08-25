import { isTauri } from '@tauri-apps/api/core'
import { createStorage } from '../adapters/storage/indexeddb/create-storage.js'
import { browserHttp } from '../adapters/platform/browser/browser-http.js'
import { browserFile } from '../adapters/platform/browser/browser-file.js'
import { browserSettings } from '../adapters/platform/browser/browser-settings.js'
import type { Platform } from './platform.js'

/** Android is full-screen; only a desktop window has geometry worth restoring. */
const isDesktop = (): boolean => !/android|iphone|ipad/i.test(navigator.userAgent)

const nativePlatform = async (): Promise<Platform> => {
  const [{ tauriHttp }, { tauriFile }, { tauriSettings }] = await Promise.all([
    import('../adapters/platform/tauri/tauri-http.js'),
    import('../adapters/platform/tauri/tauri-file.js'),
    import('../adapters/platform/tauri/tauri-settings.js'),
  ])
  return {
    http: tauriHttp(),
    file: tauriFile(),
    settings: tauriSettings(),
    storage: createStorage(),
    native: true,
    restoresWindowGeometry: isDesktop(),
  }
}

const webPlatform = (): Platform => ({
  http: browserHttp(),
  file: browserFile(),
  settings: browserSettings(),
  storage: createStorage(),
  native: false,
  restoresWindowGeometry: false,
})

/**
 * The single place adapters are chosen. Tauri modules are behind a dynamic import
 * so the browser bundle never evaluates them — importing a Tauri plugin outside
 * Tauri throws at module scope, which would break the browser build entirely.
 */
export const createPlatform = async (): Promise<Platform> => {
  switch (isTauri()) {
    case true:
      return await nativePlatform()
    case false:
      return webPlatform()
  }
}
