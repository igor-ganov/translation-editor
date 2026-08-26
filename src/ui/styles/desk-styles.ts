import { css } from 'lit'

/**
 * Everything you can do to a document, grouped by what it does to your work.
 *
 * Each group says so in a line of plain text, because a heading alone does not
 * tell you that one of these spends money and another only writes a file.
 */
export const deskStyles = css`
  .desk {
    display: grid;
    gap: calc(var(--step) * 5);
    max-width: 40rem;
    margin-top: calc(var(--step) * 5);
  }
  .group {
    border-top: 1px solid var(--rule);
    padding-top: calc(var(--step) * 2);
  }
  .group__what {
    font-size: 0.8125rem;
    color: var(--ink-faint);
    margin: 0 0 calc(var(--step) * 1.5);
    max-width: var(--measure);
  }
`
