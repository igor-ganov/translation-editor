import { boxStyles } from './styles/box-styles.js'
import { commandBarStyles } from './styles/command-bar-styles.js'
import { css } from 'lit'
import { wholeStyles } from './styles/whole-styles.js'
import { leafStyles } from './styles/leaf-styles.js'
import { writingStyles } from './styles/writing-styles.js'
import { markStyles } from './styles/mark-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'

/** The complete stylesheet for a paragraph and its own translation. */
export const blockStyles = [
  boxStyles,
  css`
    :host {
      display: block;
    }
  `,
  wholeStyles,
  leafStyles,
  commandBarStyles,
  writingStyles,
  markStyles,
  paperTypeStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
]
