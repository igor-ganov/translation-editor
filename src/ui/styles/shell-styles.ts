import { css } from 'lit'

/** The outer frame: a full-height column with room for notices above the screen. */
export const shellStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    min-height: 0;
  }
  .body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .notice {
    margin: 0;
    padding: var(--te-space-2) var(--te-space-3);
    background: var(--te-surface-raised);
    border-bottom: 1px solid var(--te-border);
    font-size: 0.875rem;
  }
  .notice.error {
    color: var(--te-state-failed);
  }
  .working {
    padding: var(--te-space-2) var(--te-space-3);
    font-size: 0.875rem;
    color: var(--te-text-muted);
  }
`
