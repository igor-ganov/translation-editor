import { boxStyles } from './styles/box-styles.js'
import { paperShellStyles } from './styles/paper-shell-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { paperFieldStyles } from './styles/paper-field-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'
import { threadStyles } from './styles/thread-styles.js'
import { deskStyles as groups } from './styles/desk-styles.js'

/** The complete stylesheet for the desk. */
export const deskStyles = [
  boxStyles,
  paperShellStyles,
  paperTypeStyles,
  paperFieldStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
  threadStyles,
  groups,
]
