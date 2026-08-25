import { css } from 'lit'
import { pairStyles } from './pair-styles.js'

/** The paragraph header reuses the pair layout and adds its own affordances. */
export const blockStyles = [
  ...pairStyles,
  css`
    :host {
      background: var(--te-surface-sunken);
      border-top: 2px solid var(--te-border);
    }
    .kind {
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--te-text-muted);
      grid-column: 1 / -1;
      margin: 0;
    }
    .overriding {
      color: var(--te-state-override);
      font-weight: 600;
    }
  `,
]
