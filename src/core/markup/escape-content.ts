import { markupSyntax } from './markup-syntax.js'

const LOOKS_LIKE_MARKER = /^⟦/gm

/**
 * Protects content that would otherwise be read back as a marker. Doubling the
 * opening bracket keeps the file hand-editable — the reader sees what happened.
 */
export const escapeContent = (text: string): string =>
  text.replace(LOOKS_LIKE_MARKER, markupSyntax.escapedOpen)
