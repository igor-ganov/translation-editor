import { css } from 'lit'

/**
 * The commands for one segment, kept apart from what the segment *is*.
 *
 * Both used to share one line at one weight, so a reader could not tell the
 * fact ("not translated") from the things they could press. The state is now a
 * line of its own, quieter and with no affordance on it at all; the commands
 * sit under it in a bar, each with a drawn hint beside its word.
 */
export const commandBarStyles = css`
  .leaf__state {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: calc(var(--step) * 1.5);
    margin: calc(var(--step) * 1.5) 0 0;
    font-size: 0.8125rem;
    color: var(--ink-faint);
  }

  .leaf__commands {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--step) * 0.5) calc(var(--step) * 2.5);
    list-style: none;
    margin: calc(var(--step) * 0.5) 0 0;
    padding: 0;
  }
  .leaf__commands .act {
    gap: 0.45em;
  }
  .command__icon {
    width: 1.15em;
    height: 1.15em;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .act[disabled] .command__icon {
    opacity: 0.55;
  }
`
