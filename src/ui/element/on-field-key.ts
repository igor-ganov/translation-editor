import { Option } from 'effect'
import type { SegmentId } from '../../core/document/types.js'
import { emit } from './emit.js'
import { fieldOf } from './field-of.js'
import { segmentEvents } from './segment-events.js'

/**
 * Blurring first lets the field's own `change` commit the edit; approving after
 * that is what makes the approval stick. Emitting the edit here instead would
 * have the later blur re-commit it and clear the approval straight back off.
 */
const approveAndLeave = (host: HTMLElement, id: SegmentId) => (field: HTMLTextAreaElement): void => {
  field.blur()
  emit(host, segmentEvents.approve, { id, approved: true })
}

const leave = () => (field: HTMLTextAreaElement): void => {
  field.blur()
}

const ACTIONS: Readonly<
  Record<string, (host: HTMLElement, id: SegmentId) => (field: HTMLTextAreaElement) => void>
> = {
  approve: approveAndLeave,
  leave,
}

const actionFor = (event: KeyboardEvent): Option.Option<string> =>
  Option.fromIterable(
    [
      { when: event.key === 'Enter' && (event.ctrlKey || event.metaKey), name: 'approve' },
      { when: event.key === 'Escape', name: 'leave' },
    ]
      .filter((candidate) => candidate.when)
      .map((candidate) => candidate.name),
  )

/** `Ctrl+Enter` approves and moves on; `Escape` leaves the field. */
export const onFieldKey =
  (host: HTMLElement, id: SegmentId) =>
  (event: KeyboardEvent): void => {
    for (const name of Option.toArray(actionFor(event))) {
      for (const field of Option.toArray(fieldOf(event))) {
        event.preventDefault()
        ACTIONS[name]?.(host, id)(field)
      }
    }
  }
