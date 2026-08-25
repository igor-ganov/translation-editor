import { Option } from 'effect'
import type { Fiber } from 'effect'
import type { Project } from '../../core/project/types.js'

/**
 * The fibre of the translation run in progress, so the header's cancel button has
 * something to interrupt. Held outside the store because it is a live handle, not
 * state to render.
 */
export const runningTranslation: { current: Option.Option<Fiber.RuntimeFiber<Project>> } = {
  current: Option.none(),
}
