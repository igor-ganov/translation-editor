/**
 * The markup vocabulary, in one place so the serialiser and the parser can never
 * disagree. U+27E6/U+27E7 are used as markers because they survive copy-paste
 * through editors and chat clients and effectively never occur in prose.
 */
export const markupSyntax = {
  open: '⟦',
  close: '⟧',
  headerPrefix: '#!',
  magic: 'translation-editor',
  version: '1',
  /** A content line that would look like a marker is escaped by doubling the opener. */
  escapedOpen: '⟦⟦',
  /** Global flag is required by `matchAll`; the anchors keep it a single match. */
  markerLine: /^⟦([^⟧\n]+)⟧(.*)$/g,
  headerLine: /^#!([a-z-]+)[ ]+(.+)$/g,
} as const
