import { css } from 'lit'
import { roughOutline } from './rough-outline.js'

/** The two ranks either side of a plain outline: commits, and irreversible. */
export const actRankStyles = css`
  /* The one that commits. There is never more than one on a screen. */
  .act--commit {
    color: var(--paper);
    font-weight: 500;
  }
  .act--commit::before,
  li:nth-child(2n) .act--commit::before,
  li:nth-child(3n) .act--commit::before {
    background-image: ${roughOutline('ink', 3, 'filled')};
  }

  /* Destructive, and it looks it. */
  .act--undo {
    color: var(--mark-trouble);
  }
  .act--undo::before,
  li:nth-child(2n) .act--undo::before,
  li:nth-child(3n) .act--undo::before {
    background-image: ${roughOutline('trouble', 2)};
  }
  /* Red, but still only a word: a drawn red box on every row of a list would
     shout louder than the one action on the screen that commits anything. */
  .act--quiet.act--undo {
    border-bottom-color: var(--mark-trouble);
  }
  .act--quiet.act--undo::before {
    background-image: none;
  }
`
