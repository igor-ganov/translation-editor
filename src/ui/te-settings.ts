import { LitElement, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { Settings } from '../ports/settings-port.js'
import type { ProviderId } from '../ports/provider-port.js'
import { renderSettingsForm } from './render/render-settings-form.js'

/** Provider credentials, model, and the project's default language pair. */
@customElement('te-settings')
export class TeSettings extends LitElement {
  static override styles = css`
    :host { display: block; padding: var(--te-space-4); }
    label { display: grid; gap: var(--te-space-1); margin-bottom: var(--te-space-3); }
    input, select { min-height: var(--te-touch-target); padding: 0 var(--te-space-2); font: inherit;
      color: var(--te-text); background: var(--te-surface-raised);
      border: 1px solid var(--te-border); border-radius: var(--te-radius); }
    button { min-height: var(--te-touch-target); padding: 0 var(--te-space-3); font: inherit;
      color: var(--te-text); background: var(--te-surface-raised);
      border: 1px solid var(--te-border); border-radius: var(--te-radius); cursor: pointer; }
    .warning { color: var(--te-state-edited); font-size: 0.875rem; }
    .actions { display: flex; gap: var(--te-space-2); flex-wrap: wrap; }
  `

  @property({ attribute: false })
  settings: Settings | undefined = undefined

  @property({ type: Boolean })
  secure = true

  /** Tracks the provider as the user picks it, so the form shows its fields at once. */
  @state()
  private chosen: ProviderId | undefined = undefined

  override render() {
    return renderSettingsForm(this, this.settings, this.secure, this.chosen, (next) => {
      this.chosen = next
    })
  }
}

declare global {
  interface HTMLElementTagNameMap { 'te-settings': TeSettings }
}
