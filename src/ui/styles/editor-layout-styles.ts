import { css } from 'lit'

/** A sticky header over a scrolling list, with the safe area respected on mobile. */
export const editorLayoutStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  header {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: var(--te-space-3);
    padding-top: max(var(--te-space-3), env(safe-area-inset-top));
    background: var(--te-surface);
    border-bottom: 1px solid var(--te-border);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--te-space-2);
    margin-top: var(--te-space-2);
  }
  .list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .empty {
    padding: var(--te-space-6);
    text-align: center;
    color: var(--te-text-muted);
  }
`
