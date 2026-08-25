import { Effect } from 'effect'
import type { StorageFailure } from '../../../ports/storage-port.js'
import type { StoreName } from './stores.js'
import { openDatabase } from './open-database.js'

const settle = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onabort = () => {
      reject(new Error(transaction.error?.message ?? 'transaction aborted'))
    }
    transaction.onerror = () => {
      reject(new Error(transaction.error?.message ?? 'transaction failed'))
    }
  })

/**
 * Runs work inside one IndexedDB transaction and resolves only once it commits.
 * Waiting for the commit is what makes a write survivable: a process killed
 * mid-transaction leaves the previous value intact rather than half of the new one.
 */
export const transact =
  (stores: readonly StoreName[], mode: IDBTransactionMode) =>
  <A>(work: (transaction: IDBTransaction) => Promise<A>): Effect.Effect<A, StorageFailure> =>
    Effect.tryPromise({
      try: async () => {
        const database = await openDatabase()
        const transaction = database.transaction([...stores], mode)
        // The connection is shared and stays open; closing it here would abort
        // any transaction another operation has in flight.
        const [result] = await Promise.all([work(transaction), settle(transaction)])
        return result
      },
      catch: (cause): StorageFailure => ({ tag: 'storageFailed', message: String(cause) }),
    })
