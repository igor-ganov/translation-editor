import type { SegmentStatus } from './segment-status.js'

export type Mark = { readonly modifier: string; readonly word: string }

/**
 * A dot and a word. The word is not decoration: colour alone would leave the
 * five states indistinguishable to a reader who cannot separate them, and the
 * shortest of these is still shorter than an icon nobody can read.
 */
const MARKS: Readonly<Record<SegmentStatus, Mark>> = {
  untranslated: { modifier: 'mark--untouched', word: 'untouched' },
  machine: { modifier: 'mark--machine', word: 'drafted' },
  edited: { modifier: 'mark--hand', word: 'your wording' },
  approved: { modifier: 'mark--settled', word: 'settled' },
  failed: { modifier: 'mark--trouble', word: 'went wrong' },
}

export const markOfStatus = (status: SegmentStatus): Mark => MARKS[status]
