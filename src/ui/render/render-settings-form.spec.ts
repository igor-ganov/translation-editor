// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type { ProviderId } from '../../ports/provider-port.js'
import type { Settings } from '../../ports/settings-port.js'
import { renderSettingsForm } from './render-settings-form.js'

const settings = (providerId: ProviderId): Settings => ({
  providerId,
  model: 'claude-opus-5',
  baseUrl: undefined,
  apiKeys: { anthropic: 'secret' },
  defaultLanguages: { from: 'it', to: 'ru' },
  batchTokens: 2000,
  lastProjectId: undefined,
})

const draw = (providerId: ProviderId): HTMLElement => {
  const host = document.createElement('div')
  render(
    renderSettingsForm(host, {
      settings: settings(providerId),
      secure: true,
      providerId,
      verdict: undefined,
      hasDocument: false,
      choose: () => undefined,
    }),
    host,
  )
  return host
}

const names = (host: HTMLElement): readonly string[] =>
  Array.from(host.querySelectorAll('input, select')).map((element) => element.getAttribute('name') ?? '')

describe('settings form', () => {
  it('offers key but no address for a cloud service', () => {
    expect(names(draw('anthropic'))).toEqual(['providerId', 'model', 'apiKey', 'from', 'to'])
  })

  it('offers an address and no key for Ollama, which has no authentication', () => {
    expect(names(draw('ollama'))).toEqual(['providerId', 'model', 'baseUrl', 'from', 'to'])
  })

  it('offers both for llama.cpp, whose key is optional', () => {
    expect(names(draw('llamacpp'))).toEqual(['providerId', 'model', 'apiKey', 'baseUrl', 'from', 'to'])
  })

  it('commits in exactly one place', () => {
    expect(draw('anthropic').querySelectorAll('.act--commit')).toHaveLength(1)
  })

  it('wraps every control in the drawn box the outline is painted on', () => {
    const host = draw('llamacpp')
    const boxed = Array.from(host.querySelectorAll('input, select')).filter(
      (element) => element.parentElement?.classList.contains('field__box') === true,
    )
    expect(boxed).toHaveLength(names(host).length)
  })

  it('keeps the saved language pair selected', () => {
    const host = draw('anthropic')
    const from = host.querySelector('select[name="from"]')
    expect(from?.querySelector('option[selected]')?.getAttribute('value')).toBe('it')
  })
})
