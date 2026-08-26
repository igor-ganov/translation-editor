import { css } from 'lit'

/** Changes the view only, so it is a word underlined like a reference. */
export const actQuietStyles = css`
  .act--quiet {
    position: relative;
    min-height: auto;
    padding: 0.35em 0;
    font-size: 0.875rem;
    color: var(--ink-soft);
    border-bottom: 1px solid var(--rule);
  }
  /* A word is the right amount of ink and the wrong size of target. This grows
     the touchable area to a thumb's worth without drawing anything. */
  .act--quiet::after {
    content: '';
    position: absolute;
    inset: -0.75rem -0.4rem;
  }
  .act--quiet::before,
  li:nth-child(2n) .act--quiet::before,
  li:nth-child(3n) .act--quiet::before {
    background-image: none;
  }
  .act--quiet:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }
  .act--quiet[aria-pressed='true'] {
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
  }
`
