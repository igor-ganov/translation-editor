import { css } from 'lit'

/** The source text, the editing field, and the status and approval controls. */
export const pairFieldStyles = css`
  .source {
    font-family: var(--te-font-reading);
    color: var(--te-text-muted);
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
  }
  textarea {
    width: 100%;
    min-height: 3rem;
    resize: none;
    overflow: hidden;
    font: inherit;
    line-height: 1.5;
    color: var(--te-text);
    background: var(--te-surface-raised);
    border: 1px solid var(--te-border);
    border-radius: var(--te-radius);
    padding: var(--te-space-2);
  }
  textarea:disabled {
    opacity: 0.55;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: var(--te-space-1);
    font-size: 0.8125rem;
    color: var(--te-text-muted);
  }
  label {
    display: inline-flex;
    align-items: center;
    gap: var(--te-space-2);
    min-height: var(--te-touch-target);
    cursor: pointer;
  }
  input[type='checkbox'] {
    width: 1.25rem;
    height: 1.25rem;
  }
`
