/**
 * `anthropic-version` is required by the API and is unrelated to the model version.
 * The direct-browser-access opt-in matters only for the browser build; under Tauri
 * the request is made from Rust, where CORS does not apply.
 */
export const anthropicHeaders = (apiKey: string | undefined): Readonly<Record<string, string>> => ({
  'content-type': 'application/json',
  'x-api-key': apiKey ?? '',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
})
