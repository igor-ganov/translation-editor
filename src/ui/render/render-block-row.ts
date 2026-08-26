import { Option, pipe } from 'effect'
import { nothing } from 'lit'
import type { BlockRow } from '../../core/view/types.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { renderWhole } from './render-whole.js'

/** The paragraph, or nothing while the row is still being assigned. */
export const renderBlockRow = (host: HTMLElement, row: BlockRow | undefined) =>
  pipe(
    fromUndefined(row),
    Option.map((present) => renderWhole(host, present)),
    Option.getOrElse(() => nothing),
  )
