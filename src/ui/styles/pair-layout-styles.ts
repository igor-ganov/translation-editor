import { css } from 'lit'

/**
 * Mobile-first. Source and translation stack on a phone and sit side by side once
 * the *container* is wide enough — a container query rather than a media query, so
 * the same component behaves correctly inside a narrow pane on a desktop too.
 */
export const pairLayoutStyles = css`
  :host {
    display: block;
    /* The virtualiser positions rows absolutely, so a row with no width of its
       own collapses to zero and its text wraps one character per line. */
    width: 100%;
    box-sizing: border-box;
    container-type: inline-size;
    border-bottom: 1px solid var(--te-border);
    background: var(--te-surface);
  }
  .grid {
    display: grid;
    gap: var(--te-space-2);
    padding: var(--te-space-3);
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--te-space-3);
    flex-wrap: wrap;
  }
  @container (min-width: 720px) {
    .grid {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
    .bar {
      grid-column: 1 / -1;
    }
  }
`
