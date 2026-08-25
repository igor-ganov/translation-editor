import type { Option } from 'effect'
import type { SegmentId } from '../../document/types.js'

export type OpenSegment = { readonly id: SegmentId; readonly parts: readonly string[] }

export type Accumulator = {
  readonly segments: ReadonlyMap<SegmentId, string>
  readonly current: Option.Option<OpenSegment>
}
