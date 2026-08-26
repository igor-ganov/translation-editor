import { Option, pipe } from 'effect'
import { nothing } from 'lit'
import type { SentenceRow } from '../../core/view/types.js'
import type { SentenceMode } from './sentence-mode.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { renderLeaf } from './render-leaf.js'

/** One sentence pair, or nothing while the row is still being assigned. */
export const renderSentencePair = (
  host: HTMLElement,
  row: SentenceRow | undefined,
  mode: SentenceMode,
) =>
  pipe(
    fromUndefined(row),
    Option.map((present) => renderLeaf(host, present, mode)),
    Option.getOrElse(() => nothing),
  )
