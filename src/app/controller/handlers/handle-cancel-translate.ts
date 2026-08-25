import { Effect, Fiber, Option } from 'effect'
import { setBusy } from '../set-busy.js'
import { setNotice } from '../set-notice.js'
import { runningTranslation } from '../running-translation.js'
import type { Deps } from '../deps.js'

/** Interrupts the run. Batches already stored stay; the next run resumes from there. */
export const handleCancelTranslate = (deps: Deps) => (): void => {
  for (const fiber of Option.toArray(runningTranslation.current)) {
    void Effect.runPromise(Fiber.interrupt(fiber))
  }
  runningTranslation.current = Option.none()
  setBusy(deps)({ tag: 'idle' })
  setNotice(deps)({ tag: 'info', text: 'Translation cancelled. Finished batches were kept.' })
}
