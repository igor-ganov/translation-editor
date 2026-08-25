import { Option, pipe } from 'effect'

/** "1 segment" rather than "1 segments"; English needs nothing cleverer here. */
export const plural = (count: number, one: string, many: string): string =>
  `${String(count)} ${pipe(
    Option.liftPredicate((value: number) => value === 1)(count),
    Option.map(() => one),
    Option.getOrElse(() => many),
  )}`
