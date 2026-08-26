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
    /* One column while writing, so the editor has the whole width of the page. */
    .leaf__pair--writing {
      grid-template-columns: 1fr;
    }
  }

  /* The target is set by writing-styles, which owns both of its states. */
  .leaf__source {
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.62;
    margin: 0;
    max-width: var(--measure);
    color: var(--ink-soft);
  }

  /* The state line and the command bar are set by command-bar-styles. */
`
