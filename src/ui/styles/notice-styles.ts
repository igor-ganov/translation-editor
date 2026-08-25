import { css } from 'lit'

/**
 * A message needs room to be read.
 *
 * It wraps, it never clips, and its dismiss control sits beside the text rather
 * than over it. The version this replaces was a one-line strip above a dense row
 * of controls, where a failure that explains itself in a sentence arrived cut in
 * half — which is exactly how it reached a real phone.
 */
export const noticeStyles = css`
  .notice {
    display: flex;
    align-items: flex-start;
    gap: var(--te-space-3);
    margin: 0;
    padding: var(--te-space-3);
    padding-top: max(var(--te-space-3), env(safe-area-inset-top));
    background: var(--te-surface-raised);
    border-bottom: 1px solid var(--te-border);
    font-size: 0.9375rem;
    line-height: 1.45;
  }
  .notice__text {
    margin: 0;
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .notice__close {
    flex: none;
    min-height: var(--te-touch-target);
    padding: 0 var(--te-space-2);
    font: inherit;
    font-size: 0.875rem;
    color: var(--te-text-muted);
    background: none;
    border: 0;
    text-decoration: underline;
    cursor: pointer;
  }
  .notice__close:hover {
    color: var(--te-text);
  }
  .notice--error {
    color: var(--te-state-failed);
    border-bottom: 2px solid var(--te-state-failed);
  }
`
