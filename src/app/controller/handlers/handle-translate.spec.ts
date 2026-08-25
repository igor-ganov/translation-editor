import { describe, expect, it, vi } from 'vitest'
import { Brand, Effect, Option } from 'effect'
import type { SegmentId } from '../../../core/document/types.js'
import type { AppState } from '../../../ui/store/app-state.js'
import { createStore } from '../../../ui/store/create-store.js'
import { initialState } from '../../initial-state.js'
import { createLogger } from '../../create-logger.js'
import { handleTranslate } from './handle-translate.js'
import { stubPlatform } from '../../../../tests/support/stub-platform.js'
import { buildProject } from '../../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()

/** Anthropic's envelope: a forced tool call carrying the translations. */
const reply = (segments: readonly { id: string; text: string }[]) => ({
  content: [{ type: 'tool_use', input: { segments } }],
})

const setUp = (respond: () => unknown) => {
  const project = buildProject({ blocks: [{ text: 'One thing happened.' }] })
  const http = { send: () => Effect.sync(() => ({ status: 200, body: JSON.stringify(respond()) })) }
  const platform = stubPlatform(http)
  const store = createStore<AppState>({ ...initialState, project: Option.some(project) })
  const logger = createLogger()
  return { deps: { platform, store, logger }, project, logger }
}

const settle = async () => {
  await vi.waitFor(() => {
    expect(true).toBe(true)
  })
  await new Promise((resolve) => setTimeout(resolve, 50))
}

describe('handleTranslate', () => {
  it('actually runs the translation rather than being interrupted at once', async () => {
    const { deps } = setUp(() => reply([{ id: 'b0.s0', text: 'Одно случилось.' }]))

    handleTranslate(deps)()
    await vi.waitUntil(() => deps.store.get().busy.tag === 'idle', { timeout: 5000 })

    const translated = Option.getOrThrow(deps.store.get().project).entries.get(id('b0.s0'))
    expect(translated?.translation).toStrictEqual({ tag: 'machine', text: 'Одно случилось.' })
  })

  it('returns to idle when there is nothing outstanding, instead of hanging on 0 of 0', async () => {
    const { deps } = setUp(() => reply([]))
    deps.store.update((state) => ({
      ...state,
      project: Option.map(state.project, (project) => ({
        ...project,
        entries: new Map([[id('b0.s0'), { translation: { tag: 'machine' as const, text: 'done' }, approved: true }]]),
      })),
    }))

    handleTranslate(deps)()
    await vi.waitUntil(() => deps.store.get().busy.tag === 'idle', { timeout: 5000 })
    expect(deps.store.get().busy).toStrictEqual({ tag: 'idle' })
  })

  it('persists each batch as it lands', async () => {
    const { deps } = setUp(() => reply([{ id: 'b0.s0', text: 'Одно случилось.' }]))

    handleTranslate(deps)()
    await vi.waitUntil(() => deps.store.get().busy.tag === 'idle', { timeout: 5000 })
    await settle()

    expect(deps.platform.saved.length).toBeGreaterThan(0)
  })

  it('records the run in the diagnostic log, so a failure on a phone is readable', async () => {
    const { deps, logger } = setUp(() => reply([{ id: 'b0.s0', text: 'Одно случилось.' }]))

    handleTranslate(deps)()
    await vi.waitUntil(() => deps.store.get().busy.tag === 'idle', { timeout: 5000 })

    const messages = logger.entries().map((item) => item.message)
    expect(messages.some((message) => message.includes('run started'))).toBe(true)
    expect(messages.some((message) => message.includes('run finished'))).toBe(true)
  })
})
