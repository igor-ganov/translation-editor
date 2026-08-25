import type { ProjectId, SegmentId } from '../../core/document/types.js'

type Edit = { readonly id: SegmentId; readonly text: string }
type Approve = { readonly id: SegmentId; readonly approved: boolean }
type Segment = { readonly id: SegmentId }
type Filter = { readonly filter: string }
type ProjectRef = { readonly id: ProjectId }
type Form = Readonly<Record<string, string>>

/**
 * Declaring the custom events makes `addEventListener` hand back a correctly
 * typed detail, so no listener has to assert the shape of its own payload.
 */
declare global {
  interface HTMLElementEventMap {
    'te-edit': CustomEvent<Edit>
    'te-approve': CustomEvent<Approve>
    'te-approve-block': CustomEvent<Approve>
    'te-toggle-collapse': CustomEvent<Segment>
    'te-clear-override': CustomEvent<Segment>
    'te-merge-next': CustomEvent<Segment>
    'te-split': CustomEvent<{ readonly id: SegmentId; readonly offset: number }>
    'te-retry': CustomEvent<Segment>
    'te-filter-change': CustomEvent<Filter>
    'te-cursor-move': CustomEvent<Segment>
    'te-translate': CustomEvent<Record<string, never>>
    'te-cancel-translate': CustomEvent<Record<string, never>>
    'te-export-docx': CustomEvent<Record<string, never>>
    'te-export-markup': CustomEvent<Record<string, never>>
    'te-import-markup': CustomEvent<Record<string, never>>
    'te-confirm-import': CustomEvent<Record<string, never>>
    'te-cancel-import': CustomEvent<Record<string, never>>
    'te-next-unapproved': CustomEvent<Record<string, never>>
    'te-undo': CustomEvent<Record<string, never>>
    'te-open-settings': CustomEvent<Record<string, never>>
    'te-close-project': CustomEvent<Record<string, never>>
    'te-scroll-to': CustomEvent<Segment>
    'te-import-docx': CustomEvent<Record<string, never>>
    'te-open-project': CustomEvent<ProjectRef>
    'te-remove-project': CustomEvent<ProjectRef>
    'te-save-settings': CustomEvent<Form>
    'te-test-provider': CustomEvent<Form>
    'te-back': CustomEvent<Record<string, never>>
  }
}
