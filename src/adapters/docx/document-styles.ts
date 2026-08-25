/**
 * Calibri is chosen for full Cyrillic and extended-Latin coverage, so Russian and
 * Italian output renders as one typeface instead of falling back per glyph.
 */
export const documentStyles = {
  default: {
    document: { run: { font: 'Calibri', size: 22 } },
  },
} as const
