import type { BlockId } from '../document/types.js'
import type { PendingSentence } from './select-untranslated.js'

export type Batch = {
  readonly sentences: readonly PendingSentence[]
}

/** Rough token estimate; four characters per token is close enough to size a batch. */
const estimateTokens = (text: string): number => Math.ceil(text.length / 4)

const costOf = (sentences: readonly PendingSentence[]): number =>
  sentences.reduce((total, sentence) => total + estimateTokens(sentence.text), 0)

const groupByBlock = (sentences: readonly PendingSentence[]): readonly (readonly PendingSentence[])[] =>
  [...sentences.reduce((groups, sentence) => {
    const existing = groups.get(sentence.blockId) ?? []
    return new Map(groups).set(sentence.blockId, [...existing, sentence])
  }, new Map<BlockId, readonly PendingSentence[]>())].map(([, group]) => group)

const append = (batches: readonly Batch[], group: readonly PendingSentence[], budget: number): readonly Batch[] => {
  const last = batches.at(-1)
  switch (last !== undefined && costOf([...last.sentences, ...group]) <= budget) {
    case true:
      return [...batches.slice(0, -1), { sentences: [...(last?.sentences ?? []), ...group] }]
    case false:
      return [...batches, { sentences: group }]
  }
}

/**
 * Splits the pending work into provider requests. A paragraph is never split
 * across two batches, so the model always sees a whole thought; a single paragraph
 * larger than the budget becomes its own batch rather than being dropped.
 */
export const planBatches =
  (budgetTokens: number) =>
  (sentences: readonly PendingSentence[]): readonly Batch[] =>
    groupByBlock(sentences).reduce<readonly Batch[]>(
      (batches, group) => append(batches, group, budgetTokens),
      [],
    )
