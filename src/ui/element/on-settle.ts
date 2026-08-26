import type { SegmentId } from '../../core/document/types.js'
import { emit } from './emit.js'

/**
 * Settling is a toggle on a word, not a checkbox.
 *
 * A checkbox labelled "Approved" sat in a row of controls and read as one more
 * widget; "settle" and "unsettle" say what pressing it does, and the current
 * state is carried by `aria-pressed` rather than by a box that has to be looked at.
 */
export const onSettle =
  (host: HTMLElement, id: SegmentId, approved: boolean, eventName: string) =>
  (): void => {
    emit(host, eventName, { id, approved: !approved })
  }
