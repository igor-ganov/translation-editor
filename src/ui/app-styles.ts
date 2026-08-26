import { boxStyles } from './styles/box-styles.js'
import { css } from 'lit'
import { shellStyles } from './styles/shell-styles.js'
import { noticeStyles } from './styles/notice-styles.js'
import { slipStyles } from './styles/slip-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'

/** The complete stylesheet for the application shell. */
export const appStyles = [
  boxStyles,
  shellStyles,
  noticeStyles,
  slipStyles,
  paperTypeStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
  css`
    .slip .warning {
      color: var(--mark-trouble);
      font-size: 0.875rem;
      line-height: 1.45;
      margin: 0 0 calc(var(--step) * 2);
    }
    .slip .acts {
      margin-top: calc(var(--step) * 2);
    }
  `,
]
