import { Option, pipe } from 'effect'
import type { Project } from '../project/types.js'
import { blockUnits } from './block-units.js'
import { addUnits } from './add-units.js'
import type { Units } from './block-units.js'

export type Progress = Units & {
  readonly approvedRatio: number
  readonly coverageRatio: number
}

/** Zero units means an empty document, not a division by zero. */
const ratio = (part: number, total: number): number =>
  pipe(
    Option.liftPredicate((value: number) => value > 0)(total),
    Option.map((value) => part / value),
    Option.getOrElse(() => 0),
  )

/**
 * Document-wide progress: how much is approved, and how much is translated at all.
 * Both share a denominator so the two bars are directly comparable.
 */
export const projectProgress = (project: Project): Progress => {
  const totals = project.source
    .map((block) => blockUnits(project)(block))
    .reduce(addUnits, { total: 0, translated: 0, approved: 0 })
  return {
    ...totals,
    approvedRatio: ratio(totals.approved, totals.total),
    coverageRatio: ratio(totals.translated, totals.total),
  }
}
