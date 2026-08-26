import { css } from 'lit'

/**
 * Contents, set as a table of contents is: titles left, folios right, dot
 * leaders between. Each line says what is left to do on that page, so the
 * contents double as the progress view and remove a separate screen.
 */
export const contentsStyles = css`
  .contents {
    list-style: none;
    margin: calc(var(--step) * 4) 0 0;
    padding: 0;
    max-width: 40rem;
  }
  .contents li {
    display: flex;
    align-items: baseline;
    border-bottom: 1px solid var(--rule);
  }
  .contents li:first-child {
    border-top: 1px solid var(--rule);
  }
  .contents__row {
    display: flex;
    align-items: baseline;
    gap: calc(var(--step) * 1.5);
    width: 100%;
    min-height: var(--touch);
    padding: calc(var(--step) * 1.5) 0;
    font: inherit;
    color: inherit;
    text-align: left;
    background: none;
    border: 0;
    cursor: pointer;
  }
`
