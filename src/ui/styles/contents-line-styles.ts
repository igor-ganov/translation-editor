import { css } from 'lit'

/** The four parts of a contents line, and how the current page is marked. */
export const contentsLineStyles = css`
  .contents__title {
    font-family: var(--serif);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 55%;
  }
  .contents__lead {
    flex: 1;
    border-bottom: 1px dotted var(--rule);
    transform: translateY(-0.25em);
  }
  .contents__state {
    font-size: 0.75rem;
    color: var(--ink-faint);
    white-space: nowrap;
  }
  .contents__folio {
    font-variant-numeric: tabular-nums;
    color: var(--ink-soft);
    min-width: 1.5rem;
    text-align: right;
  }
  [aria-current='page'] .contents__title,
  [aria-current='page'] .contents__folio {
    font-weight: 600;
    color: var(--ink);
  }
`
