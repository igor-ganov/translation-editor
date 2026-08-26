import type { Units } from '../../core/approval/block-units.js'

/**
 * The thread said in words, so neither of its two colours carries anything on
 * its own. Nothing settled and everything settled are the two states a reader
 * checks at a glance, so each gets its own sentence rather than a bare ratio.
 */
export const renderProjectsWords = (units: Units): string => {
  switch (units.approved) {
    case 0:
      return `${String(units.total)} sentences · ${String(units.translated)} drafted, none settled yet`
    case units.total:
      return `${String(units.total)} sentences · all settled`
    default:
      return `${String(units.total)} sentences · ${String(units.approved)} settled · ${String(units.translated)} drafted`
  }
}
