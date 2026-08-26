import { emit } from '../element/emit.js'
import { readForm } from '../element/read-form.js'

/** Reads the form once and sends it, so Save and the check see identical values. */
export const sendForm = (host: HTMLElement, name: string) => () => {
  emit(host, name, readForm(host.shadowRoot ?? host))
}
