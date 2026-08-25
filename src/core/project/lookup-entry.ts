import type { Option } from 'effect'
import type { SegmentId } from '../document/types.js'
import { fromUndefined } from '../option/from-undefined.js'
import type { Entry } from './types.js'

/**
 * Reads one entry as an Option, so everything downstream works in Options and
 * never has to deal with a missing key.
 */
export const lookupEntry =
  (entries: ReadonlyMap<SegmentId, Entry>) =>
  (id: SegmentId): Option.Option<Entry> =>
    fromUndefined(entries.get(id))
