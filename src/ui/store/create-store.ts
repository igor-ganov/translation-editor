export type Store<A> = {
  readonly get: () => A
  readonly set: (next: A) => void
  readonly update: (change: (current: A) => A) => void
  readonly subscribe: (listener: (value: A) => void) => () => void
}

/**
 * A minimal observable value. The application state is one immutable object;
 * components subscribe and re-render, which keeps every state transition a pure
 * function of the previous state rather than a scatter of local mutations.
 */
export const createStore = <A>(initial: A): Store<A> => {
  let value = initial
  const listeners = new Set<(value: A) => void>()
  const set = (next: A): void => {
    value = next
    for (const listener of listeners) listener(next)
  }
  return {
    get: () => value,
    set,
    update: (change) => {
      set(change(value))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
