import { Option } from 'effect'
import type { EditorRow } from '../../core/view/types.js'
import { emit } from './emit.js'
import { editorEvents } from './editor-events.js'

const APPROXIMATE_ROW_HEIGHT = 140
const THROTTLE_MS = 1000

let lastSent = 0

const scrollerOf = (event: Event): Option.Option<HTMLElement> =>
  Option.liftPredicate((target: unknown): target is HTMLElement => target instanceof HTMLElement)(event.target)

const due = (now: number): Option.Option<number> =>
  Option.liftPredicate((moment: number) => moment - lastSent > THROTTLE_MS)(now)

/**
 * Reports the segment at the top of the viewport so the position can be restored
 * on reopening. An id is stored rather than a pixel offset, so the position
 * survives a font-size change, a rotation, and moving between phone and desktop.
 */
export const onScroll =
  (host: HTMLElement, rows: readonly EditorRow[]) =>
  (event: Event): void => {
    for (const scroller of Option.toArray(scrollerOf(event))) {
      for (const moment of Option.toArray(due(performance.now()))) {
        lastSent = moment
        const index = Math.floor(scroller.scrollTop / APPROXIMATE_ROW_HEIGHT)
        for (const row of Option.toArray(Option.fromIterable(rows.slice(index, index + 1)))) {
          emit(host, editorEvents.cursorMove, { id: row.id })
        }
      }
    }
  }
