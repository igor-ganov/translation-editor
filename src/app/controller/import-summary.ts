import type { ImportDiff } from '../../core/markup/diff-import.js'

/**
 * What the user confirms before anything is written. Approvals that would be lost
 * are stated separately, because that is the part that costs real work.
 */
export const importSummary = (diff: ImportDiff): string =>
  [
    `Add ${String(diff.added.length)} translations.`,
    `Change ${String(diff.changed.length)}.`,
    `Leave ${String(diff.unchanged.length)} untouched.`,
    `Ignore ${String(diff.unknownIds.length)} unknown ids.`,
    `${String(diff.missingIds.length)} segments are not in the file.`,
    `${String(diff.approvalsToClear.length)} approvals will be cleared.`,
  ].join('\n')
