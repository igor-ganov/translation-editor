import type { LanguagePair, Project } from './types.js'

/**
 * Changes which languages a document is read and written in.
 *
 * The pair was fixed at import from whatever the settings happened to say, and
 * nothing could change it afterwards — so an Italian document imported under the
 * default pair was sent to the service with English named as its source, and the
 * only place that was visible was a diagnostic log.
 *
 * Sentence boundaries are deliberately left alone. They are the user's own work
 * once a sentence has been joined or broken by hand, and re-cutting the document
 * to suit a new source language would silently throw that work away.
 */
export const setLanguages =
  (languages: LanguagePair) =>
  (project: Project): Project => ({ ...project, languages, updatedAt: Date.now() })
