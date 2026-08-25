import type { SegmentStatus } from './segment-status.js'

/**
 * Every state is conveyed by a symbol *and* words. Colour alone would leave the
 * status unreadable to a screen reader and to anyone who cannot distinguish the
 * palette, and these labels are what gets announced.
 */
export const statusLabel: Record<SegmentStatus, { readonly icon: string; readonly text: string }> = {
  untranslated: { icon: '○', text: 'Not translated' },
  machine: { icon: '◆', text: 'Machine translated' },
  edited: { icon: '✎', text: 'Edited' },
  approved: { icon: '✓', text: 'Approved' },
  failed: { icon: '!', text: 'Translation failed' },
}
