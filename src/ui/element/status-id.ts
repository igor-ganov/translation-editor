import type { SegmentId } from '../../core/document/types.js'

/**
 * A DOM id for a segment's status badge.
 *
 * Segment ids contain a dot (`b12.s3`), and `#b12.s3` parses as "id b12 with
 * class s3" — so the dot is replaced rather than left for every call site to
 * escape.
 */
export const statusId = (id: SegmentId): string => `status-${id.replace('.', '-')}`
