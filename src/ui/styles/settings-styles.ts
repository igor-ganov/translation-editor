import { css } from 'lit'

/** The settings page: a narrow column of fields, and one sentence about languages. */
export const settingsStyles = css`
  /* A column of short fields, not a page-wide form. */
  .page.colophon {
    max-width: 32rem;
  }

  section {
    margin-top: calc(var(--step) * 4);
  }

  .warning {
    max-width: var(--measure);
    font-size: 0.875rem;
    color: var(--mark-trouble);
  }

  .verdict {
    margin: calc(var(--step) * 1.5) 0 0;
    font-size: 0.875rem;
  }
  /* In the tree from the start, silent until the check has answered. */
  .verdict:empty { display: none; }
  .verdict--good { color: var(--mark-settled); }
  .verdict--bad { color: var(--mark-trouble); }

  /* "From ... into ..." reads across, so the direction of translation is a sentence. */
  .pair {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: calc(var(--step) * 1.5);
    align-items: end;
    max-width: 28rem;
    margin: calc(var(--step) * 2) 0 0;
  }
  .pair .field { margin: 0; }
  .pair__into {
    padding-bottom: 0.85rem;
    font-size: 0.875rem;
    color: var(--ink-faint);
  }

  .acts.acts--check { margin-top: calc(var(--step) * 3); }
  .acts.acts--close { margin-top: calc(var(--step) * 6); }
`
