import { Option } from 'effect'
import type { SegmentId } from '../../core/document/types.js'
import { emit } from './emit.js'
import { fieldOf } from './field-of.js'
import { segmentEvents } from './segment-events.js'

/** Commits an edit when the field loses focus. */
export const onCommit =
  (host: HTMLElement, id: SegmentId) =>
  (event: Event): void => {
    for (const field of Option.toArray(fieldOf(event))) {
      emit(host, segmentEvents.edit, { id, text: field.value })
    }
  }
