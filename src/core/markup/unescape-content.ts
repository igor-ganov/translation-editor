const ESCAPED_MARKER = /^⟦⟦/gm

/** Reverses `escapeContent`. */
export const unescapeContent = (text: string): string => text.replace(ESCAPED_MARKER, '⟦')
