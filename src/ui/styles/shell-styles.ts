import { css } from 'lit'

/** The outer frame: a full-height column with room for notices above the screen. */
export const shellStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    min-height: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
  }
  .body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .working {
    padding: calc(var(--step) * 2);
    font-family: var(--serif);
    font-style: italic;
    color: var(--ink-faint);
  }
`
