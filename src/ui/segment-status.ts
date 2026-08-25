import type { TranslationState } from '../core/project/types.js'

export type SegmentStatus = 'untranslated' | 'machine' | 'edited' | 'approved' | 'failed'

const OF_TRANSLATION: Record<TranslationState['tag'], SegmentStatus> = {
  absent: 'untranslated',
  machine: 'machine',
  edited: 'edited',
  failed: 'failed',
}

/** Indexed by `Number(approved)`, which keeps the choice branch-free. */
const BY_APPROVAL: readonly ((state: TranslationState) => SegmentStatus)[] = [
  (state) => OF_TRANSLATION[state.tag],
  () => 'approved',
]

/** Approval wins over the translation's own state, because it is the later fact. */
export const segmentStatus = (state: TranslationState, approved: boolean): SegmentStatus =>
  (BY_APPROVAL[Number(approved)] ?? BY_APPROVAL[0] ?? (() => 'untranslated'))(state)
