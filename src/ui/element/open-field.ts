import { Option, pipe } from 'effect'
import { autoGrow } from './auto-grow.js'

const fieldIn = (host: HTMLElement): Option.Option<HTMLTextAreaElement> =>
  Option.liftPredicate((node: unknown): node is HTMLTextAreaElement => node instanceof HTMLTextAreaElement)(
    host.shadowRoot?.querySelector('textarea'),
  )

const open = (host: HTMLElement): void => {
  for (const field of Option.toArray(fieldIn(host))) {
    autoGrow(field)
    field.focus()
    field.setSelectionRange(field.value.length, field.value.length)
  }
}

/**
 * Sizes the editor to its text and puts the caret at the end of it.
 *
 * Growing only on `input` left a field opened over an existing translation one
 * line tall with the rest of the sentence scrolled out of sight, which is how a
 * paragraph of Russian came to be shown as a single clipped line.
 */
export const openField = (host: HTMLElement, entering: boolean): void =>
  pipe(
    Option.liftPredicate((value: boolean) => value)(entering),
    Option.map(() => {
      open(host)
    }),
    Option.getOrElse(() => undefined),
  )
