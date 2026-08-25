import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { AppState } from './store/app-state.js'
import { appStyles } from './app-styles.js'
import { renderApp } from './render/render-app.js'
import { renderNotice } from './render/render-notice.js'
import { renderBusy } from './render/render-busy.js'
import { renderPendingImport } from './render/render-pending-import.js'
import { startApp } from '../app/start-app.js'

/**
 * The shell. It owns nothing but the current state snapshot: the store publishes,
 * this re-renders, and every action is handled by a listener attached at startup.
 */
@customElement('te-app')
export class TeApp extends LitElement {
  static override styles = appStyles

  @state()
  private snapshot: AppState | undefined = undefined

  private release: (() => void) | undefined = undefined

  override connectedCallback(): void {
    super.connectedCallback()
    void startApp(this, (next) => {
      this.snapshot = next
    }).then((release) => {
      this.release = release
    })
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.release?.()
  }

  override render() {
    const snapshot = this.snapshot
    switch (snapshot) {
      case undefined:
        return html`<p class="working">Starting…</p>`
      default:
        return html`
          ${renderNotice(this, snapshot.notice)} ${renderBusy(snapshot.busy)}
          ${renderPendingImport(this, snapshot.pendingImport)}
          <div class="body">${renderApp(snapshot)}</div>
        `
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-app': TeApp
  }
}
