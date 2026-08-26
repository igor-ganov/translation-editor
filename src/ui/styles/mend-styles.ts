import { css } from 'lit'

/**
 * The panel that explains a sentence break and repairs one.
 *
 * Set apart the way a footnote is, so it reads as an explanation rather than as
 * more controls. It is folded away by default because it is needed on a handful
 * of sentences in a document and was previously on every one of them.
 */
export const mendStyles = css`
  .mend {
    margin: calc(var(--step) * 2) 0 0 calc(var(--step) * 2);
    padding-left: calc(var(--step) * 2);
    border-left: 2px solid var(--paper-edge);
  }
  /* The aside class is set by the page stylesheet, which does not reach into
     this shadow root; without this the explanation prints at reading size. */
  .mend .aside {
    margin: 0;
    max-width: var(--measure);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink-soft);
  }
  .mend .acts {
    margin: calc(var(--step) * 2) 0;
  }
  .mend__note {
    color: var(--ink-faint);
    font-size: 0.8125rem;
  }
`
