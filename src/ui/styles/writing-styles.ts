import { css } from 'lit'

/**
 * The translation: set as text when it is being read, ruled like paper when it
 * is being written. Both are the same face, size and rhythm as the source, so
 * turning one into the other does not move the words on the page.
 */
export const writingStyles = css`
  .leaf__target {
    display: block;
    width: 100%;
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.62;
    max-width: var(--measure);
    overflow-wrap: break-word;
  }
  .leaf__target--empty {
    color: var(--ink-faint);
    font-style: italic;
  }

  /* The editor spans the page rather than a column, because a long sentence is
     easier to work on across the full width than in half of it. */
  .leaf__target--write {
    max-width: none;
    outline: 0;
    min-height: 1.62em;
    padding: 0;
    border: 0;
    resize: none;
    overflow: hidden;
    font: inherit;
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.62;
    background: transparent;
    background-image: linear-gradient(transparent calc(100% - 1px), var(--mark-hand) 1px);
    background-size: 100% 1.62em;
  }
  .leaf__target--write::placeholder {
    color: var(--ink-faint);
    font-style: italic;
  }
`
