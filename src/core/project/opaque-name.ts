/**
 * Names that identify a file to the system but not to a person.
 *
 * Android's picker hands back a content URI, so a document imported on a phone
 * was stored as `document%3A1000060316` and called that on every screen. New
 * imports are named better; this is what lets a document already stored under
 * one of these be repaired rather than left with it for ever.
 */
const OPAQUE: readonly RegExp[] = [
  /%[0-9A-Fa-f]{2}/,
  /^[a-z][a-z0-9+.-]*:/i,
  /^\d+$/,
]

export const opaqueName = (name: string): boolean =>
  OPAQUE.some((pattern) => pattern.test(name.trim()))
