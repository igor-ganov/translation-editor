import { boxStyles } from './styles/box-styles.js'
import { paperShellStyles } from './styles/paper-shell-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'
import { contentsStyles } from './styles/contents-styles.js'
import { contentsLineStyles } from './styles/contents-line-styles.js'

/** The complete stylesheet for the contents. */
export const contentsScreenStyles = [
  boxStyles,
  paperShellStyles,
  paperTypeStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
  contentsStyles,
  contentsLineStyles,
]
