import { stores } from './stores.js'
import { databaseName } from './database-name.js'

const createStores = (database: IDBDatabase): void => {
  database.createObjectStore(stores.projects, { keyPath: 'id' })
  database.createObjectStore(stores.blocks, { keyPath: 'projectId' })
  database.createObjectStore(stores.entries, { keyPath: ['projectId', 'segmentId'] })
  database.createObjectStore(stores.originals, { keyPath: 'projectId' })
}

const connect = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName.name, databaseName.version)
    request.onupgradeneeded = () => {
      createStores(request.result)
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'IndexedDB refused to open'))
    }
  })

let connection: Promise<IDBDatabase> | undefined = undefined

/**
 * One connection for the lifetime of the page, opened lazily.
 *
 * Opening per operation deadlocks: an `open` issued while another connection is
 * still finishing its upgrade blocks, and under concurrent writes the two end up
 * waiting on each other. A single shared connection removes that, and is cheaper.
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  connection = connection ?? connect()
  return connection
}
