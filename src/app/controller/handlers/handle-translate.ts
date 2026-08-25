import { Effect, Option, pipe } from 'effect'
import type { Project } from '../../../core/project/types.js'
import { runTranslation } from '../../../core/translation/run-translation.js'
import { selectUntranslated } from '../../../core/translation/select-untranslated.js'
import { createProvider } from '../../../adapters/providers/create-provider.js'
import { providerConfig } from '../../actions/provider-config.js'
import { setBusy } from '../set-busy.js'
import { setNotice } from '../set-notice.js'
import { finishNotice } from '../finish-notice.js'
import { translationOutcome } from '../../../core/translation/translation-outcome.js'
import { runningTranslation } from '../running-translation.js'
import type { Deps } from '../deps.js'

const publish = (deps: Deps) => (project: Project, done: number, total: number) =>
  Effect.sync(() => {
    deps.logger.record('info', 'translate', `batch stored: ${String(done)}/${String(total)}`)
    deps.store.update((state) => ({ ...state, project: Option.some(project) }))
    setBusy(deps)({ tag: 'translating', done, total })
    void Effect.runPromise(Effect.ignore(deps.platform.storage.saveProject(project)))
  })

const start = (deps: Deps) => (project: Project) => {
  const settings = deps.store.get().settings
  const provider = createProvider(settings.providerId)(providerConfig(settings))(deps.platform.http)
  return pipe(
    runTranslation({ provider, budgetTokens: settings.batchTokens, onBatchDone: publish(deps) })(project),
    Effect.tap((finished) =>
      Effect.sync(() => {
        const outcome = translationOutcome(finished)
        deps.logger.record('info', 'translate', 'run finished', outcome)
        setBusy(deps)({ tag: 'idle' })
        setNotice(deps)(finishNotice(outcome))
      }),
    ),
  )
}

/**
 * Translates everything outstanding. Progress is published per batch and each
 * batch is stored as it lands, so cancelling keeps whatever already finished.
 */
export const handleTranslate = (deps: Deps) => (): void => {
  for (const project of Option.toArray(deps.store.get().project)) {
    // The total is counted up front so the first thing shown is the real figure
    // rather than "0 of 0" until the first batch comes back.
    const outstanding = selectUntranslated(project).length
    deps.logger.record('info', 'translate', `run started, ${String(outstanding)} segments outstanding`, {
      provider: deps.store.get().settings.providerId,
      model: deps.store.get().settings.model,
      languages: `${project.languages.from}>${project.languages.to}`,
    })
    setBusy(deps)({ tag: 'translating', done: 0, total: outstanding })
    // `runFork`, not `fork` inside `runPromise`: a forked child belongs to the
    // scope of the fibre that forked it, and that root fibre finishes as soon as
    // it has stored the handle — taking the translation down with it.
    runningTranslation.current = Option.some(Effect.runFork(start(deps)(project)))
  }
}
