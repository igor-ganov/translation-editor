import { css } from 'lit'

/**
 * A paragraph translation, set apart the way a block quotation is.
 *
 * This is the one rule the whole application turns on — a line written here
 * replaces every sentence under it — so it is marked by an inked rule down the
 * left edge rather than by a badge somebody has to learn.
 */
export const wholeStyles = css`
  .whole {
    position: relative;
    padding: calc(var(--step) * 2) 0 calc(var(--step) * 2) calc(var(--step) * 3);
    margin: calc(var(--step) * 2) 0;
  }
  .whole--ruling::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: repeating-linear-gradient(
      to bottom,
      var(--mark-hand) 0 7px,
      color-mix(in srgb, var(--mark-hand) 55%, transparent) 7px 12px
    );
  }
  /* Superseded sentences are dimmed, never hidden: the point is that they are kept. */
  :host([superseded]) .leaf {
    opacity: 0.55;
  }
`
