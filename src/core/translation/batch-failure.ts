import type { ProviderError } from '../../ports/provider-port.js'
import type { ReconcileFailure } from './reconcile-batch.js'

/** Everything that can cost a batch: the service refused it, or its reply did not check out. */
export type BatchFailure = ProviderError | ReconcileFailure
