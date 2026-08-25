import { css } from 'lit'

/** Buttons and selects, sized for a thumb on a phone and shared by every screen. */
export const controlStyles = css`
  button,
  select {
    min-height: var(--te-touch-target);
    padding: 0 var(--te-space-3);
    font: inherit;
    color: var(--te-text);
    background: var(--te-surface-raised);
    border: 1px solid var(--te-border);
    border-radius: var(--te-radius);
    cursor: pointer;
  }
  button:hover,
  select:hover {
    border-color: var(--te-accent);
  }
  button[hidden] {
    display: none;
  }
`
