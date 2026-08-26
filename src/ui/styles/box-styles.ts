import { css } from 'lit'

/**
 * Border-box sizing, once per shadow root.
 *
 * The `*` rule in the document stylesheet does not cross a shadow boundary, so
 * every component has to say this for itself. Without it a padded element that
 * is also `width: 100%` is wider than its parent by exactly its padding, which
 * is how a page 380px wide came to scroll sideways by 32.
 */
export const boxStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`
