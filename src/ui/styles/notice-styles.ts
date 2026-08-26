import { css } from 'lit'

/**
 * A message needs room to be read.
 *
 * It wraps, it never clips, it stays until dismissed rather than fading out
 * mid-sentence, and its dismiss control sits beside the text rather than over
 * it. The version this replaces was a one-line strip above a dense row of
 * controls, where a failure that explains itself in a sentence arrived cut in
 * half — which is exactly how it reached a real phone.
 */
export const noticeStyles = css`
  .notice {
    display: flex;
    align-items: flex-start;
    gap: calc(var(--step) * 1.5);
    margin: 0;
    padding: calc(var(--step) * 1.5) calc(var(--step) * 2);
    padding-top: max(calc(var(--step) * 1.5), env(safe-area-inset-top));
    background: var(--paper-deep);
    border-bottom: 1px solid var(--rule);
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
    min-height: var(--touch);
    padding: 0 var(--step);
    font: inherit;
    font-size: 0.875rem;
    color: var(--ink-soft);
    background: none;
    border: 0;
    border-bottom: 1px solid var(--rule);
    cursor: pointer;
  }
  .notice__close:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }
  .notice--error {
    color: var(--mark-trouble);
    border-bottom: 2px solid var(--mark-trouble);
  }
`
