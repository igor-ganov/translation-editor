import { css } from 'lit'

/**
 * Marginalia: the state of a segment.
 *
 * Never the only carrier of meaning — the word is there beside the dot, so the
 * colour is confirmation rather than the message.
 */
export const markStyles = css`
  .mark {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35em;
    white-space: nowrap;
  }
  .mark::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: currentColor;
    transform: translateY(-0.05em);
  }
  .mark--none {
    color: var(--mark-untouched);
  }
  .mark--machine {
    color: var(--mark-machine);
  }
  .mark--edited {
    color: var(--mark-hand);
  }
  .mark--approved {
    color: var(--mark-settled);
  }
  .mark--failed {
    color: var(--mark-trouble);
  }
`
