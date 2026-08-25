import { describe, expect, it } from 'vitest'
import { Brand, Effect } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project } from '../project/types.js'
import type { ProviderError, TranslatableSegment, TranslationProvider } from '../../ports/provider-port.js'
import { runTranslation } from './run-translation.js'
import { selectUntranslated } from './select-untranslated.js'
import { buildProject, edited, entry, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const source = 'One thing happened. Then another.'

/** A provider whose behaviour is scripted per call, so retries are observable. */
const scriptedProvider = (
  script: readonly ('ok' | 'transient' | 'auth' | 'drop')[],
): TranslationProvider & { readonly calls: { count: number } } => {
  const calls = { count: 0 }
  return {
    calls,
    id: 'ollama',
    listModels: () => Effect.succeed([]),
    // Suspended so each retry re-reads the script instead of replaying a value
    // that was decided when the effect was built.
    translate: (request) =>
      Effect.suspend((): Effect.Effect<readonly TranslatableSegment[], ProviderError> => {
        const step = script[calls.count] ?? 'ok'
        calls.count += 1
        const echo: readonly TranslatableSegment[] = request.segments.map((segment) => ({
          id: segment.id,
          text: `T:${segment.text}`,
        }))
        const transient: ProviderError = { tag: 'transient', status: 503, message: 'busy' }
        const auth: ProviderError = { tag: 'auth', message: 'bad key' }
        switch (step) {
          case 'ok':
            return Effect.succeed(echo)
          case 'drop':
            return Effect.succeed(echo.slice(1))
          case 'transient':
            return Effect.fail(transient)
          case 'auth':
            return Effect.fail(auth)
        }
      }),
  }
}

/** A budget of 1 forces one batch per paragraph, which is what multi-batch cases need. */
const run = async (
  project: Project,
  script: readonly ('ok' | 'transient' | 'auth' | 'drop')[],
  budgetTokens = 10_000,
) => {
  const provider = scriptedProvider(script)
  const saved: Project[] = []
  const result = await Effect.runPromise(
    runTranslation({
      provider,
      budgetTokens,
      onBatchDone: (next) => Effect.sync(() => void saved.push(next)),
    })(project),
  )
  return { result, saved, calls: provider.calls.count }
}

describe('runTranslation', () => {
  it('translates every outstanding sentence', async () => {
    const { result } = await run(buildProject({ blocks: [{ text: source }] }), ['ok'])
    expect(result.entries.get(id('b0.s0'))?.translation).toStrictEqual({
      tag: 'machine',
      text: 'T:One thing happened.',
    })
    expect(selectUntranslated(result)).toStrictEqual([])
  })

  it('retries a transient failure and then succeeds', async () => {
    const { result, calls } = await run(buildProject({ blocks: [{ text: source }] }), [
      'transient', 'transient', 'ok',
    ])
    expect(calls).toBe(3)
    expect(result.entries.get(id('b0.s0'))?.translation.tag).toBe('machine')
  })

  it('does not retry an auth failure', async () => {
    const { calls } = await run(buildProject({ blocks: [{ text: source }] }), ['auth'])
    expect(calls).toBe(1)
  })

  it('marks a batch failed and keeps the run going', async () => {
    const project = buildProject({ blocks: [{ text: source }, { text: 'Third one.' }] })
    const { result } = await run(project, ['auth', 'ok'], 1)
    expect(result.entries.get(id('b0.s0'))?.translation.tag).toBe('failed')
    expect(result.entries.get(id('b1.s0'))?.translation.tag).toBe('machine')
  })

  it('rejects a batch where the provider dropped a segment', async () => {
    const { result } = await run(buildProject({ blocks: [{ text: source }] }), ['drop'])
    expect(result.entries.get(id('b0.s0'))?.translation.tag).toBe('failed')
    expect(result.entries.get(id('b0.s1'))?.translation.tag).toBe('failed')
  })

  it('persists after every batch, so an interrupted run keeps what finished', async () => {
    const project = buildProject({ blocks: [{ text: 'One.' }, { text: 'Two.' }, { text: 'Three.' }] })
    const { saved } = await run(project, ['ok', 'ok', 'ok'], 1)
    expect(saved).toHaveLength(3)
  })

  it('never overwrites an edited translation', async () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(edited('mine')) },
    })
    const { result } = await run(project, ['ok'])
    expect(result.entries.get(id('b0.s0'))?.translation).toStrictEqual({ tag: 'edited', text: 'mine' })
    expect(result.entries.get(id('b0.s1'))?.translation.tag).toBe('machine')
  })

  it('never overwrites an approved translation', async () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('kept'), true) },
    })
    const { result } = await run(project, ['ok'])
    expect(result.entries.get(id('b0.s0'))?.translation).toStrictEqual({ tag: 'machine', text: 'kept' })
  })

  it('resumes: a second run only handles what is still outstanding', async () => {
    const project = buildProject({ blocks: [{ text: source }, { text: 'Third one.' }] })
    const first = await run(project, ['auth', 'ok'], 1)
    const second = await run(first.result, ['ok'], 1)
    expect(second.result.entries.get(id('b0.s0'))?.translation.tag).toBe('machine')
    expect(second.calls).toBe(1)
  })

  it('does nothing when there is no outstanding work', async () => {
    const project = buildProject({
      blocks: [{ text: 'Alone.' }],
      entries: { 'b0.s0': entry(machine('done')) },
    })
    const { calls } = await run(project, ['ok'])
    expect(calls).toBe(0)
  })
})
