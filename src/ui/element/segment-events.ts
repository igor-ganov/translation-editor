import type { SegmentId } from '../../core/document/types.js'

export type EditDetail = { readonly id: SegmentId; readonly text: string }
export type ApproveDetail = { readonly id: SegmentId; readonly approved: boolean }
export type BlockToggleDetail = { readonly id: SegmentId }
export type BoundaryDetail = { readonly id: SegmentId; readonly offset: number }

/** Event names, in one place so a listener and its emitter cannot drift apart. */
export const segmentEvents = {
  edit: 'te-edit',
  approve: 'te-approve',
  approveBlock: 'te-approve-block',
  toggleCollapse: 'te-toggle-collapse',
  clearOverride: 'te-clear-override',
  mergeNext: 'te-merge-next',
  split: 'te-split',
  retry: 'te-retry',
} as const
