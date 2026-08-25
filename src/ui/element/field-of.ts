import { Option } from 'effect'

/**
 * The textarea an event came from, if it came from one. Typed against `unknown`
 * rather than the DOM's own nullable target type, so absence stays an Option.
 */
export const fieldOf = (event: Event): Option.Option<HTMLTextAreaElement> =>
  Option.liftPredicate((target: unknown): target is HTMLTextAreaElement =>
    target instanceof HTMLTextAreaElement,
  )(event.target)
