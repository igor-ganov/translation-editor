import { css } from 'lit'

/** Two bars in one track: coverage behind, approval in front. */
export const progressStyles = css`
  .progress {
    position: relative;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--te-surface-sunken);
    overflow: hidden;
  }
  .coverage,
  .approved {
    position: absolute;
    inset-block: 0;
    left: 0;
    border-radius: 999px;
  }
  .coverage {
    background: var(--te-state-machine);
    opacity: 0.35;
  }
  .approved {
    background: var(--te-state-approved);
  }
  .counts {
    margin: var(--te-space-2) 0 0;
    font-size: 0.8125rem;
  }
  .muted {
    color: var(--te-text-muted);
  }
`
