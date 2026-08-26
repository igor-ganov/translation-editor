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
  .mark--untouched {
    color: var(--mark-untouched);
  }
  .mark--machine {
    color: var(--mark-machine);
  }
  .mark--hand {
    color: var(--mark-hand);
  }
  .mark--settled {
    color: var(--mark-settled);
  }
  .mark--trouble {
    color: var(--mark-trouble);
  }
`
