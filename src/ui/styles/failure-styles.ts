import { css } from 'lit'

/**
 * The reason a segment failed, set to wrap.
 *
 * A message squeezed onto one line beside a dense row of controls arrived cut in
 * half, which is how an explanation that fits in a sentence became unreadable.
 */
export const failureStyles = css`
  .failure {
    flex-basis: 100%;
    max-width: var(--measure);
    color: var(--mark-trouble);
    font-size: 0.8125rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
`
