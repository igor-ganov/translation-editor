import { Option } from 'effect'
import type { SegmentId } from '../../core/document/types.js'
import type { EditorRow } from '../../core/view/types.js'
import { rowIndexOf } from '../../core/view/row-index-of.js'

type Virtualizer = Element & { readonly scrollToIndex: (index: number, position: string) => void }

const virtualizerIn = (host: HTMLElement): Option.Option<Virtualizer> =>
  Option.liftPredicate((element: unknown): element is Virtualizer =>
    element instanceof HTMLElement && 'scrollToIndex' in element,
  )(host.shadowRoot?.querySelector('lit-virtualizer'))

/**
 * Brings a segment into view by index. Only rows the current filter actually
 * shows can be scrolled to, so an id that is filtered out is simply ignored.
 */
export const scrollToRow =
  (host: HTMLElement, rows: readonly EditorRow[]) =>
  (id: SegmentId): void => {
    for (const virtualizer of Option.toArray(virtualizerIn(host))) {
      for (const index of Option.toArray(rowIndexOf(rows)(id))) {
        virtualizer.scrollToIndex(index, 'start')
      }
    }
  }
