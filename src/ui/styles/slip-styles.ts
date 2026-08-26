import { css } from 'lit'
import { roughOutline } from './rough-outline.js'

/** A sheet of paper laid over the page, for the few screens that stop and ask. */
export const slipStyles = css`
  .slip {
    position: relative;
    max-width: 34rem;
    margin: calc(var(--step) * 3) 0;
    padding: calc(var(--step) * 3);
    background: var(--paper-deep);
  }
  .slip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${roughOutline('inkSoft', 2)} no-repeat center / 100% 100%;
    pointer-events: none;
  }
  .slip dl {
    margin: 0 0 calc(var(--step) * 2);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.3em 1em;
  }
  .slip dt {
    color: var(--ink-soft);
    font-size: 0.9375rem;
  }
  .slip dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
`
