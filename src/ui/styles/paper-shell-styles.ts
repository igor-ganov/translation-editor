import { css } from 'lit'

/** Where you are, always: a spine at the top and a page under it. */
export const paperShellStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    color: var(--ink);
    font-family: var(--sans);
  }

  .spine {
    display: flex;
    align-items: baseline;
    gap: var(--step);
    padding: calc(var(--step) * 1.5) calc(var(--step) * 2);
    border-bottom: 1px solid var(--rule);
    background: var(--paper);
  }
  .spine__work {
    font-family: var(--serif);
    font-size: 1.0625rem;
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .spine__where {
    margin-left: auto;
    font-size: 0.8125rem;
    color: var(--ink-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .page {
    flex: 1;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: calc(var(--step) * 3) calc(var(--step) * 2) calc(var(--step) * 4);
  }
`
