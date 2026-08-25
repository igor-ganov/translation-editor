// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { Brand, Effect, Option } from 'effect'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import type { ProjectId, SegmentId } from '../../../core/document/types.js'
import type { StoragePort } from '../../../ports/storage-port.js'
import { buildProject, entry, machine } from '../../../../tests/support/build-project.js'

/**
 * The adapter memoises its connection for the lifetime of the page, so each test
 * gets a fresh module as well as a fresh database — otherwise the cached handle
 * would still point at the previous test's data.
 */
const freshStorage = async (): Promise<StoragePort> => {
  vi.resetModules()
  globalThis.indexedDB = new IDBFactory()
  const { createStorage } = await import('./create-storage.js')
  return createStorage()
}

const id = Brand.nominal<SegmentId>()
const projectId = Brand.nominal<ProjectId>()
const run = <A>(effect: Effect.Effect<A, unknown>) => Effect.runPromise(Effect.orDie(effect))

const project = buildProject({
  blocks: [{ text: 'One thing happened. Then another.' }],
  entries: { 'b0.s0': entry(machine('Одно случилось.'), true) },
})

describe('createStorage', () => {
  it('round-trips a project through the database', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject(project))
    const loaded = await run(storage.loadProject(project.id))
    expect(Option.getOrThrow(loaded).source).toStrictEqual(project.source)
    expect(Option.getOrThrow(loaded).entries.get(id('b0.s0'))).toStrictEqual(entry(machine('Одно случилось.'), true))
  })

  it('reports an unknown project as absent rather than failing', async () => {
    expect(Option.isNone(await run((await freshStorage()).loadProject(projectId('missing'))))).toBe(true)
  })

  it('writes a single entry without rewriting the project', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject(project))
    await run(storage.saveEntry(project.id)(id('b0.s1'), entry(machine('Потом другое.'))))
    const loaded = Option.getOrThrow(await run(storage.loadProject(project.id)))
    expect(loaded.entries.get(id('b0.s1'))?.translation).toStrictEqual({ tag: 'machine', text: 'Потом другое.' })
    expect(loaded.entries.get(id('b0.s0'))?.approved).toBe(true)
  })

  it('remembers the cursor position across a reload', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject(project))
    await run(storage.saveCursor(project.id)(id('b0.s1')))
    expect(Option.getOrThrow(await run(storage.loadProject(project.id))).cursor).toBe('b0.s1')
  })

  it('lists projects most recently updated first', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject({ ...project, id: projectId('a'), name: 'older', updatedAt: 1 }))
    await run(storage.saveProject({ ...project, id: projectId('b'), name: 'newer', updatedAt: 2 }))
    expect((await run(storage.listProjects())).map((summary) => summary.name)).toStrictEqual(['newer', 'older'])
  })

  it('keeps projects isolated from one another', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject({ ...project, id: projectId('a') }))
    await run(storage.saveEntry(projectId('b'))(id('b0.s0'), entry(machine('other'))))
    const loaded = Option.getOrThrow(await run(storage.loadProject(projectId('a'))))
    expect(loaded.entries.get(id('b0.s0'))?.translation).toStrictEqual({ tag: 'machine', text: 'Одно случилось.' })
  })

  it('deletes a project and everything belonging to it', async () => {
    const storage = await freshStorage()
    await run(storage.saveProject(project))
    await run(storage.deleteProject(project.id))
    expect(await run(storage.listProjects())).toStrictEqual([])
    expect(Option.isNone(await run(storage.loadProject(project.id)))).toBe(true)
  })

  it('stores the original file bytes for re-export', async () => {
    const storage = await freshStorage()
    const bytes = new Uint8Array([80, 75, 3, 4])
    await run(storage.saveOriginal(project.id)(bytes))
    expect(Option.getOrThrow(await run(storage.loadOriginal(project.id)))).toStrictEqual(bytes)
  })
})
