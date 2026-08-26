import { css } from 'lit'
import { boxStyles } from './styles/box-styles.js'
import { paperShellStyles } from './styles/paper-shell-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { actStyles } from './styles/act-styles.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'
import { turnerStyles } from './styles/turner-styles.js'

/** The complete stylesheet for one page of the document. */
export const editorStyles = [
  boxStyles,
  paperShellStyles,
  paperTypeStyles,
  actStyles,
  actRankStyles,
  actQuietStyles,
  turnerStyles,
  css`
    /* Room for the page turner, which is sticky and would otherwise sit on top
       of the last sentence on the page. */
    .page {
      padding-bottom: calc(var(--step) * 12);
    }
  `,
]
