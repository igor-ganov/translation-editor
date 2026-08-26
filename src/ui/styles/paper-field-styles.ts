import { css } from 'lit'
import { roughOutline } from './rough-outline.js'

/** Fields drawn the same way as controls, so a form reads as marked-up paper. */
export const paperFieldStyles = css`
  .field {
    display: block;
    margin-bottom: calc(var(--step) * 3);
    max-width: 28rem;
  }
  .field__name {
    display: block;
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin-bottom: 0.35em;
  }
  .field__note {
    display: block;
    font-size: 0.8125rem;
    color: var(--ink-faint);
    margin-top: 0.4em;
  }
  .field__box {
    position: relative;
    display: block;
  }
  .field__box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${roughOutline('rule', 1)} no-repeat center / 100% 100%;
    pointer-events: none;
  }
  .field input,
  .field select {
    width: 100%;
    min-height: var(--touch);
    padding: 0 calc(var(--step) * 1.5);
    font: inherit;
    color: var(--ink);
    background: transparent;
    border: 0;
    outline: 0;
  }
  .field__box:focus-within::before {
    background-image: ${roughOutline('ink', 1)};
  }
`
