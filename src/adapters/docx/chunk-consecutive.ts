export type Chunk<Key, Item> = { readonly key: Key; readonly items: readonly Item[] }

/**
 * Splits a list into runs of adjacent items sharing a key, preserving order.
 * Used to lift a flat block list back into tables without losing document order.
 */
export const chunkConsecutive =
  <Key, Item>(keyOf: (item: Item) => Key) =>
  (items: readonly Item[]): readonly Chunk<Key, Item>[] =>
    items.reduce<readonly Chunk<Key, Item>[]>((chunks, item) => {
      const key = keyOf(item)
      const last = chunks.at(-1)
      switch (last?.key === key) {
        case true:
          return [...chunks.slice(0, -1), { key, items: [...(last?.items ?? []), item] }]
        case false:
          return [...chunks, { key, items: [item] }]
      }
    }, [])
