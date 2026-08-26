import { html } from 'lit'
import type { TranslationState } from '../../core/project/types.js'
import { segmentStatus } from '../segment-status.js'
import { markOfStatus } from '../mark-of-status.js'

/** The state of a segment, in the margin beside it. */
export const renderMark = (id: string, translation: TranslationState, approved: boolean) => {
  const mark = markOfStatus(segmentStatus(translation, approved))
  return html`<span id=${id} class="mark ${mark.modifier}">${mark.word}</span>`
}
