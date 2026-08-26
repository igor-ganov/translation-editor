import { css } from 'lit'

/** Documents as spines on a shelf, not as cards in a grid. */
export const shelfStyles = css`
  .shelf {
    list-style: none;
    margin: calc(var(--step) * 4) 0 0;
    padding: 0;
  }
  .shelf li {
    border-bottom: 1px solid var(--rule);
  }
  .shelf li:first-child {
    border-top: 1px solid var(--rule);
  }
  .shelf__row {
    display: flex;
    align-items: baseline;
    gap: var(--step);
    width: 100%;
    padding: calc(var(--step) * 2) 0;
    background: none;
    border: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .shelf__row:hover .shelf__title {
    border-bottom-color: var(--ink);
  }
  .shelf__title {
    font-family: var(--serif);
    font-size: 1.0625rem;
    border-bottom: 1px solid transparent;
  }
  .shelf__meta {
    margin-left: auto;
    font-size: 0.8125rem;
    color: var(--ink-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .shelf__sub {
    display: block;
    font-size: 0.8125rem;
    color: var(--ink-faint);
    margin-top: 0.3em;
  }
`
