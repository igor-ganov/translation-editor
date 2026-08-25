import type { ProviderConfig } from '../../ports/provider-port.js'

/** The configured endpoint, or the provider's default, without a trailing slash. */
export const baseUrlOf = (defaultBaseUrl: string, config: ProviderConfig): string =>
  (config.baseUrl ?? defaultBaseUrl).replace(/\/+$/, '')
