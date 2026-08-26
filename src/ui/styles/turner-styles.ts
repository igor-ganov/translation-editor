import { css } from 'lit'

/**
 * The page turner, fixed where a thumb already rests.
 *
 * The two arrows are the largest targets on the screen; everything above them is
 * reading matter. Nothing here is hidden behind a menu.
 */
export const turnerStyles = css`
  .turner {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--step);
    padding: calc(var(--step) * 1.5) calc(var(--step) * 2);
    padding-bottom: max(calc(var(--step) * 1.5), env(safe-area-inset-bottom));
    background: linear-gradient(to top, var(--paper) 70%, rgba(247, 244, 236, 0));
    border-top: 1px solid var(--rule);
  }
  .turner .act {
    min-width: 4.5rem;
  }
  .turner__folio {
    font-family: var(--serif);
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--ink-soft);
  }
  .turner__folio b {
    font-weight: 600;
    color: var(--ink);
  }
`
