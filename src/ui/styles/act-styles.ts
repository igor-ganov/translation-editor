import { css } from 'lit'
import { roughOutline } from './rough-outline.js'

/**
 * Controls ranked by what they cost.
 *
 * The old header put eleven of these in one row, identical in size and weight,
 * so nothing said that one spends money and another only changes a filter.
 * Filled commits, outlined is reversible, a plain underlined word only changes
 * what is on screen, and red is the one thing that cannot be taken back.
 */
export const actStyles = css`
  .acts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--step) * 1.5);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .act {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    min-height: var(--touch);
    padding: 0 calc(var(--step) * 2);
    font: inherit;
    font-size: 0.9375rem;
    color: var(--ink);
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  /* The drawn outline is a pseudo-element, so it paints over the label unless it
     is pushed behind; 'isolation' keeps that negative index inside the button. */
  .act::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${roughOutline('inkSoft', 0)} no-repeat center / 100% 100%;
    pointer-events: none;
  }
  li:nth-child(2n) .act::before {
    background-image: ${roughOutline('inkSoft', 1)};
  }
  li:nth-child(3n) .act::before {
    background-image: ${roughOutline('inkSoft', 2)};
  }
  .act[disabled] {
    color: var(--ink-faint);
    cursor: default;
  }
`
