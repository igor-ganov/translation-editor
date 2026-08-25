import type { FilePort } from '../ports/file-port.js'
import type { HttpPort } from '../ports/http-port.js'
import type { SettingsPort } from '../ports/settings-port.js'
import type { StoragePort } from '../ports/storage-port.js'

export type Platform = {
  readonly http: HttpPort
  readonly file: FilePort
  readonly settings: SettingsPort
  readonly storage: StoragePort
  /** True inside Tauri. Drives the few capability differences the UI must show. */
  readonly native: boolean
  /** Desktop only: window geometry is restored, which Android has no concept of. */
  readonly restoresWindowGeometry: boolean
}
