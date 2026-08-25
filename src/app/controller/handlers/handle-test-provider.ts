import { Effect, pipe } from 'effect'
import { createProvider } from '../../../adapters/providers/create-provider.js'
import { providerConfig } from '../../actions/provider-config.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/**
 * Verifies the provider configuration with the cheapest call the API offers, and
 * reports the exact reason on failure rather than a generic error.
 */
export const handleTestProvider = (deps: Deps) => (): void => {
  const settings = deps.store.get().settings
  const provider = createProvider(settings.providerId)(providerConfig(settings))(deps.platform.http)
  void Effect.runPromise(
    pipe(
      provider.listModels(),
      Effect.map((models) => {
        deps.logger.record('info', 'provider', `connected, ${String(models.length)} models`, models.slice(0, 10))
        setNotice(deps)({ tag: 'info', text: `Connected. ${String(models.length)} models available.` })
      }),
      Effect.catchAll((failure) =>
        Effect.sync(() => {
          deps.logger.record('error', 'provider', 'connection test failed', failure)
          setNotice(deps)({ tag: 'error', text: `${failure.tag}: ${failure.message}` })
        }),
      ),
    ),
  )
}
