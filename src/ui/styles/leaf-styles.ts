import { css } from 'lit'

/**
 * A segment as it sits on the page: source above, translation under it.
 *
 * That is the order you work in on paper — read the original, write beneath it —
 * and both are set in the same face and rhythm so the eye compares like with like.
 */
export const leafStyles = css`
  .leaf {
    padding: calc(var(--step) * 2) 0;
    border-bottom: 1px solid var(--rule);
  }
  .leaf:last-of-type {
    border-bottom: 0;
  }

  .leaf__pair {
    display: grid;
    gap: calc(var(--step) * 2);
    margin: 0;
  }
  @media (min-width: 60rem) {
    .leaf__pair {
      grid-template-columns: 1fr 1fr;
    }
  }

  .leaf__source,
  .leaf__target {
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.62;
    margin: 0;
    max-width: var(--measure);
  }
  .leaf__source {
    color: var(--ink-soft);
  }

  .leaf__margin {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: calc(var(--step) * 2.5) calc(var(--step) * 2.5);
    margin: calc(var(--step) * 1.5) 0 0;
    font-size: 0.8125rem;
    color: var(--ink-faint);
  }
`
