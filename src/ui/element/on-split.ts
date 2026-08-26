import { Option } from 'effect'
import type { SentenceRow } from '../../core/view/types.js'
import { emit } from './emit.js'
import { segmentEvents } from './segment-events.js'

const sourceParagraph = (host: HTMLElement): Option.Option<HTMLElement> =>
  Option.liftPredicate((element: unknown): element is HTMLElement => element instanceof HTMLElement)(
    host.shadowRoot?.querySelector('.leaf__source'),
  )

/**
 * Splits at the caret the user placed in the source text. The offset is relative
 * to the sentence, so it is shifted onto the block's own text before being sent.
 */
export const onSplit =
  (host: HTMLElement, row: SentenceRow) =>
  (): void => {
    for (const paragraph of Option.toArray(sourceParagraph(host))) {
      const selection = paragraph.ownerDocument.getSelection()
      const within = selection?.anchorOffset ?? 0
      emit(host, segmentEvents.split, { id: row.id, offset: row.sentence.start + within })
    }
  }
