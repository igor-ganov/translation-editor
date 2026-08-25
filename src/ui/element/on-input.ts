import { Option } from 'effect'
import { autoGrow } from './auto-grow.js'
import { fieldOf } from './field-of.js'

/** Grows the field as the user types; the edit itself is committed on blur. */
export const onInput = (event: Event): void => {
  for (const field of Option.toArray(fieldOf(event))) autoGrow(field)
}
