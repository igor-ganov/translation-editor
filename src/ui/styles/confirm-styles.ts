import { css } from 'lit'

/** The import summary panel: in the page, not a modal that would block the webview. */
export const confirmStyles = css`
  .confirm {
    padding: var(--te-space-4);
    background: var(--te-surface-raised);
    border-bottom: 2px solid var(--te-accent);
  }
  .confirm h2 {
    margin: 0 0 var(--te-space-2);
    font-size: 1rem;
  }
  .confirm ul {
    margin: var(--te-space-2) 0;
    padding-left: var(--te-space-4);
  }
  .warning {
    color: var(--te-state-failed);
    font-weight: 600;
  }
  .warning[hidden] {
    display: none;
  }
  .actions {
    display: flex;
    gap: var(--te-space-2);
    flex-wrap: wrap;
  }
`
