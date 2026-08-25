import { Option } from 'effect'

/**
 * The one place an absent value from a native API becomes an Option. Keeping it
 * here means no other module needs a branch to deal with `undefined`.
 */
export const fromUndefined = <A>(value: A | undefined): Option.Option<A> => {
  switch (value) {
    case undefined:
      return Option.none()
    default:
      return Option.some(value)
  }
}
