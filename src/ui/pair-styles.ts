import { boxStyles } from './styles/box-styles.js'
import { commandBarStyles } from './styles/command-bar-styles.js'
import { css } from 'lit'
import { leafStyles } from './styles/leaf-styles.js'
import { writingStyles } from './styles/writing-styles.js'
import { markStyles } from './styles/mark-styles.js'
import { failureStyles } from './styles/failure-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'

/** The complete stylesheet for one sentence on the page. */
export const pairStyles = [
  boxStyles,
  css`
    :host {
      display: block;
    }
    :host([superseded]) .leaf {
      opacity: 0.55;
    }
  `,
  leafStyles,
  commandBarStyles,
  writingStyles,
  markStyles,
  failureStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
]
