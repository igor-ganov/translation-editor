import { Option } from 'effect'
import type { TeEditor } from '../../ui/te-editor.js'

/** The editor element inside the shell, when a document is open. */
export const editorIn = (host: HTMLElement): Option.Option<TeEditor> =>
  Option.liftPredicate((element: unknown): element is TeEditor =>
    element instanceof HTMLElement && 'reveal' in element,
  )(host.shadowRoot?.querySelector('te-editor'))
