import { css } from 'lit'

/**
 * What this one screen adds to the shared sheets: a shelf row that shares its
 * line with a quiet control, and the focus ring, which the shared act sheet
 * leaves to the browser and which a drawn outline hides at small sizes.
 */
export const projectsScreenStyles = css`
  .shelf li {
    display: flex;
    align-items: baseline;
    gap: calc(var(--step) * 2);
  }
  /* A long title must shorten itself rather than push Remove off the line. */
  .shelf__row {
    flex: 1;
    min-width: 0;
  }
  .shelf__spine {
    min-width: 0;
  }
  .shelf__title {
    display: block;
    overflow-wrap: anywhere;
  }
  .thread {
    max-width: 22rem;
    margin-top: calc(var(--step) * 0.75);
  }

  .acts {
    margin-top: calc(var(--step) * 5);
  }
  .note {
    margin-top: calc(var(--step) * 6);
    color: var(--ink-faint);
  }
  .empty {
    margin: calc(var(--step) * 4) 0 0;
  }

  .act:focus-visible,
  .shelf__row:focus-visible {
    outline: 2px solid var(--mark-machine);
    outline-offset: 3px;
  }
`
