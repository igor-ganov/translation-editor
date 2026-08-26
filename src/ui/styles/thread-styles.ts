import { css } from 'lit'

/**
 * Progress as a thread rather than a bar in a box.
 *
 * The darker line is settled work, the pale one behind it is drafted. The count
 * says the same thing in words, so neither colour carries anything on its own.
 */
export const threadStyles = css`
  .thread {
    display: flex;
    align-items: center;
    gap: calc(var(--step) * 1.5);
    margin: 0;
  }
  .thread__track {
    position: relative;
    flex: 1;
    height: 3px;
    background: var(--paper-edge);
  }
  .thread__drafted {
    position: absolute;
    inset-block: 0;
    left: 0;
    background: var(--mark-machine);
    opacity: 0.35;
  }
  .thread__done {
    position: absolute;
    inset-block: 0;
    left: 0;
    background: var(--mark-settled);
  }
  .thread__count {
    font-size: 0.8125rem;
    color: var(--ink-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`
