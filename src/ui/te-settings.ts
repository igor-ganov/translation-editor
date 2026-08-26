import { Option, pipe } from 'effect'
import { LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { Settings } from '../ports/settings-port.js'
import type { ProviderId } from '../ports/provider-port.js'
import type { SettingsVerdict } from './render/render-verdict.js'
import { fromUndefined } from '../core/option/from-undefined.js'
import { renderSettingsForm } from './render/render-settings-form.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'
import { actStyles } from './styles/act-styles.js'
import { boxStyles } from './styles/box-styles.js'
import { paperFieldStyles } from './styles/paper-field-styles.js'
import { paperShellStyles } from './styles/paper-shell-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { settingsStyles } from './styles/settings-styles.js'

/** Provider credentials, model, and the project's default language pair. */
@customElement('te-settings')
export class TeSettings extends LitElement {
  static override styles = [
    boxStyles,
    paperShellStyles,
    paperTypeStyles,
    paperFieldStyles,
    actStyles,
    actRankStyles,
    actQuietStyles,
    settingsStyles,
  ]

  @property({ attribute: false })
  settings: Settings | undefined = undefined

  @property({ type: Boolean })
  secure = true

  /** The result of the last check, kept on the page rather than in a passing toast. */
  @property({ attribute: false })
  verdict: SettingsVerdict | undefined = undefined

  /** Tracks the service as the user picks it, so the form shows its fields at once. */
  @state()
  private chosen: ProviderId | undefined = undefined

  override render() {
    return pipe(
      fromUndefined(this.settings),
      Option.map((settings) =>
        renderSettingsForm(this, {
          settings,
          secure: this.secure,
          providerId: this.chosen ?? settings.providerId,
          verdict: this.verdict,
          choose: (next: ProviderId) => {
            this.chosen = next
          },
        }),
      ),
      Option.getOrElse(() => nothing),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap { 'te-settings': TeSettings }
}
