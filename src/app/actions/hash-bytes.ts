import { Effect } from 'effect'
import { toArrayBuffer } from '../../adapters/platform/to-array-buffer.js'

const hex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')

/**
 * Identifies the imported document. A markup file carries this hash so an import
 * can refuse to land translations on a different document by mistake.
 */
export const hashBytes = (bytes: Uint8Array): Effect.Effect<string> =>
  Effect.promise(async () => hex(await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes))))
