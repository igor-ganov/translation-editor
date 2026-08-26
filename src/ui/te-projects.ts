import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { renderProjectsActs } from './render/render-projects-acts.js'
import { renderProjectsCount } from './render/render-projects-count.js'
import { renderProjectsShelf } from './render/render-projects-shelf.js'
import type { ShelfEntry } from './render/render-projects-shelf.js'
import { actRankStyles } from './styles/act-rank-styles.js'
import { actQuietStyles } from './styles/act-quiet-styles.js'
import { boxStyles } from './styles/box-styles.js'
import { actStyles } from './styles/act-styles.js'
import { paperShellStyles } from './styles/paper-shell-styles.js'
import { paperTypeStyles } from './styles/paper-type-styles.js'
import { projectsScreenStyles } from './styles/projects-screen-styles.js'
import { shelfStyles } from './styles/shelf-styles.js'
import { threadStyles } from './styles/thread-styles.js'

/** The library: every document on this device, and the one way to bring in another. */
@customElement('te-projects')
export class TeProjects extends LitElement {
  static override styles = [
    boxStyles,
    paperShellStyles,
    paperTypeStyles,
    shelfStyles,
    threadStyles,
    actStyles,
    actRankStyles,
    actQuietStyles,
    projectsScreenStyles,
  ]

  @property({ attribute: false })
  projects: readonly ShelfEntry[] = []

  override render() {
    return html`
      <header class="spine">
        <span class="spine__work">Translation Editor</span>
        <span class="spine__where">${renderProjectsCount(this.projects.length)}</span>
      </header>
      <main class="page">
        <h1>Your documents</h1>
        <p class="aside">
          Pick up where you left off, or bring in something new. Nothing here is uploaded
          anywhere: the documents and their translations sit on this device.
        </p>
        ${renderProjectsShelf(this, this.projects)} ${renderProjectsActs(this)}
        <p class="aside note">Removing a document removes its translation with it. Export first.</p>
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'te-projects': TeProjects
  }
}
