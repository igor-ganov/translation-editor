/**
 * Bridges an IndexedDB request to a promise, preserving its error message.
 *
 * The result is `unknown` on purpose: the DOM typings declare it `any`, and this
 * is the boundary where stored data re-enters the program. Callers decode it with
 * a schema, so a record written by an older version cannot crash startup.
 */
export const requestResult = (request: IDBRequest): Promise<unknown> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'IndexedDB request failed'))
    }
  })
