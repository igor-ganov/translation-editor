/** Escapes a literal for safe embedding in a RegExp source. */
export const escapeRegexp = (literal: string): string =>
  literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
