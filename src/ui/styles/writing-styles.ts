import { css } from 'lit'

/** Where the translation is written: a ruled line, as on paper — not a box. */
export const writingStyles = css`
  .leaf__target {
    display: block;
    width: 100%;
    outline: 0;
    min-height: 1.62em;
    padding: 0;
    border: 0;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.62;
    background-image: linear-gradient(transparent calc(100% - 1px), var(--paper-edge) 1px);
    background-size: 100% 1.62em;
  }
  .leaf__target:focus {
    background-image: linear-gradient(transparent calc(100% - 1px), var(--mark-hand) 1px);
  }
  .leaf__target::placeholder {
    color: var(--ink-faint);
    font-style: italic;
  }
  .leaf__target[readonly] {
    color: var(--ink-faint);
    background-image: none;
  }
  .leaf__target--settled {
    color: var(--ink);
  }
`
