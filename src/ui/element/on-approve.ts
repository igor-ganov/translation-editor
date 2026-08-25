import type { SegmentId } from '../../core/document/types.js'
import { emit } from './emit.js'
import { segmentEvents } from './segment-events.js'

/** Reports an approval toggle. A non-checkbox target reads as unapproved. */
export const onApprove =
  (host: HTMLElement, id: SegmentId, eventName: string = segmentEvents.approve) =>
  (event: Event): void => {
    const target = event.target
    emit(host, eventName, { id, approved: target instanceof HTMLInputElement && target.checked })
  }
