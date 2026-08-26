// @vitest-environment happy-dom
import { Brand } from 'effect'
import { render } from 'lit'
import { describe, expect, it } from 'vitest'
import type { ProjectId } from '../../core/document/types.js'
import { renderProjectsShelf } from './render-projects-shelf.js'
import type { ShelfEntry } from './render-projects-shelf.js'

const projectId = Brand.nominal<ProjectId>()

const entry: ShelfEntry = { id: projectId('p1'), name: 'Contratto di locazione', updatedAt: Date.now() }

const mount = (entries: readonly ShelfEntry[]): HTMLElement => {
  const host = document.createElement('div')
  render(renderProjectsShelf(host, entries), host)
  return host
}

// The global event map types the detail, so nothing here has to assert its shape.
type Asked = 'te-open-project' | 'te-remove-project'

const caught = (host: HTMLElement, type: Asked) => {
  const seen: { detail: unknown } = { detail: undefined }
  host.addEventListener(type, (event) => {
    seen.detail = event.detail
  })
  return seen
}

describe('renderProjectsShelf', () => {
  it('says the shelf is empty rather than showing an empty list', () => {
    const host = mount([])
    expect(host.querySelector('.empty')?.textContent).toContain('Nothing here yet')
    expect(host.querySelector('.shelf')).toBeFalsy()
  })

  it('lists every document as a spine', () => {
    const host = mount([entry, { ...entry, id: projectId('p2'), name: 'The Silent Observer' }])
    expect(host.querySelectorAll('.shelf li')).toHaveLength(2)
    expect(host.querySelector('.shelf__title')?.textContent).toContain('Contratto di locazione')
  })

  it('asks to open the document that was clicked', () => {
    const host = mount([entry])
    const seen = caught(host, 'te-open-project')
    host.querySelector<HTMLButtonElement>('.shelf__row')?.click()
    expect(seen.detail).toEqual({ id: 'p1' })
  })

  it('asks to remove the document that was clicked, and names it for a screen reader', () => {
    const host = mount([entry])
    const seen = caught(host, 'te-remove-project')
    const remove = host.querySelector<HTMLButtonElement>('.act--undo')
    expect(remove?.getAttribute('aria-label')).toBe('Remove Contratto di locazione')
    remove?.click()
    expect(seen.detail).toEqual({ id: 'p1' })
  })

  it('draws a thread only for an entry that arrived with counts', () => {
    expect(mount([entry]).querySelector('.thread')).toBeFalsy()
    const measured = { ...entry, progress: { total: 117, translated: 91, approved: 41 } }
    expect(mount([measured]).querySelector('.thread__count')?.textContent).toContain('41 settled')
  })
})
