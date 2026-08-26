import type { SegmentStatus } from './segment-status.js'

export type Mark = { readonly modifier: string; readonly word: string }

/**
 * A dot and a word for each state.
 *
 * The words are the ones the task already uses — translated, edited, approved —
 * not invented ones. An earlier set said "drafted", "your wording" and
 * "untouched", which read well and told nobody what they meant; a word chosen
 * for the metaphor rather than for the meaning is decoration.
 */
const MARKS: Readonly<Record<SegmentStatus, Mark>> = {
  untranslated: { modifier: 'mark--none', word: 'not translated' },
  machine: { modifier: 'mark--machine', word: 'translated' },
  edited: { modifier: 'mark--edited', word: 'edited by you' },
  approved: { modifier: 'mark--approved', word: 'approved' },
  failed: { modifier: 'mark--failed', word: 'failed' },
}

export const markOfStatus = (status: SegmentStatus): Mark => MARKS[status]
