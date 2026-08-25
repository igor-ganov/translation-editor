import type { Project } from '../project/types.js'

export type TranslationOutcome = {
  readonly failed: number
  readonly translated: number
}

/**
 * What a finished run actually achieved.
 *
 * Reported rather than a bare "finished", because a run where every batch was
 * rejected finishes just as quietly as one that worked, and the user needs to be
 * told which of the two happened.
 */
export const translationOutcome = (project: Project): TranslationOutcome => {
  const entries = [...project.entries.values()]
  return {
    failed: entries.filter((entry) => entry.translation.tag === 'failed').length,
    translated: entries.filter((entry) => entry.translation.tag === 'machine').length,
  }
}
