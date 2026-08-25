import { Option } from 'effect'

/** The select an event came from, if it came from one. */
export const selectOf = (event: Event): Option.Option<HTMLSelectElement> =>
  Option.liftPredicate((target: unknown): target is HTMLSelectElement =>
    target instanceof HTMLSelectElement,
  )(event.target)
