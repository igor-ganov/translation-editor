/**
 * Copies bytes into a plain `ArrayBuffer`.
 *
 * A `Uint8Array` may be backed by a `SharedArrayBuffer`, which `Blob` will not
 * accept, and the platform typings surface that as a type error. Copying is a
 * few microseconds on documents of this size and avoids an unchecked assertion.
 */
export const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}
