import { css } from 'lit'

/** Headings, kickers and asides, set as a book sets them. */
export const paperTypeStyles = css`
  h1,
  h2,
  h3 {
    font-family: var(--serif);
    font-weight: 600;
    margin: 0 0 var(--step);
  }
  h1 {
    font-size: 1.5rem;
    letter-spacing: -0.01em;
  }
  h2 {
    font-size: 1.125rem;
  }
  h3 {
    font-size: 1rem;
  }

  .kicker {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin: 0 0 calc(var(--step) * 0.5);
  }

  .aside {
    font-size: 0.875rem;
    color: var(--ink-soft);
    max-width: var(--measure);
  }

  .empty {
    font-family: var(--serif);
    font-style: italic;
    color: var(--ink-faint);
  }
`
