import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { ProjectSummary } from '../ports/storage-port.js'
import { emit } from './element/emit.js'
import { projectEvents } from './element/project-events.js'
import { whenPresent } from './render/when-present.js'

/** The landing screen: open an existing project, or import a new document. */
@customElement('te-projects')
export class TeProjects extends LitElement {
  static override styles = css`
    :host { display: block; padding: var(--te-space-4); }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--te-space-2); }
    li { display: flex; gap: var(--te-space-2); align-items: center; }
    button { min-height: var(--te-touch-target); padding: 0 var(--te-space-3); font: inherit;
      color: var(--te-text); background: var(--te-surface-raised);
      border: 1px solid var(--te-border); border-radius: var(--te-radius); cursor: pointer; }
    .open { flex: 1; text-align: left; }
    .empty { color: var(--te-text-muted); }
  `

  @property({ attribute: false })
  projects: readonly ProjectSummary[] = []

  override render() {
    return html`
      <h1>Translation Editor</h1>
      <div class="actions">
        <button type="button" @click=${() => { emit(this, projectEvents.importDocx, {}) }}>Import .docx</button>
        <button type="button" @click=${() => { emit(this, projectEvents.openSettings, {}) }}>Settings</button>
        <button type="button" title="Save a diagnostic log to share"
          @click=${() => { emit(this, 'te-export-log', {}) }}>Save log</button>
      </div>
      ${whenPresent(this.projects.length === 0, () => html`<p class="empty">No documents yet.</p>`)}
      <ul>
        ${this.projects.map(
          (summary) => html`
            <li>
              <button class="open" type="button"
                @click=${() => { emit(this, projectEvents.open, { id: summary.id }) }}>
                ${summary.name}
              </button>
              <button type="button" aria-label=${`Delete ${summary.name}`}
                @click=${() => { emit(this, projectEvents.remove, { id: summary.id }) }}>
                Delete
              </button>
            </li>
          `,
        )}
      </ul>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap { 'te-projects': TeProjects }
}
