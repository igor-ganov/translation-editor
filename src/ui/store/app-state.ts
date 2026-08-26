import type { Option } from 'effect'
import type { ImportDiff } from '../../core/markup/diff-import.js'
import type { Project } from '../../core/project/types.js'
import type { UndoEntry } from '../../core/undo/types.js'
import type { ProjectSummary } from '../../ports/storage-port.js'
import type { Settings } from '../../ports/settings-port.js'

export type Route = 'projects' | 'editor' | 'desk' | 'contents' | 'settings'

export type SegmentFilter = 'all' | 'untranslated' | 'unapproved' | 'failed'

export type Busy =
  | { readonly tag: 'idle' }
  | { readonly tag: 'working'; readonly label: string }
  | { readonly tag: 'translating'; readonly done: number; readonly total: number }

export type Notice =
  | { readonly tag: 'none' }
  | { readonly tag: 'info'; readonly text: string }
  | { readonly tag: 'error'; readonly text: string }

export type AppState = {
  readonly route: Route
  readonly projects: readonly ProjectSummary[]
  readonly project: Option.Option<Project>
  readonly settings: Settings
  readonly filter: SegmentFilter
  /**
   * Which page of the document is open, counted from zero.
   *
   * A page is a range of paragraphs, so this means the same paragraphs on a
   * phone as on a desktop and survives a font-size change. The old bookmark was
   * a pixel offset, which is what threw the reader to the end of the document
   * whenever anything unrelated redrew.
   */
  readonly page: number
  readonly collapsed: ReadonlySet<string>
  readonly busy: Busy
  readonly notice: Notice
  /** False in the browser build, where the settings screen warns about key storage. */
  readonly secureCredentials: boolean
  /**
   * A parsed markup import awaiting confirmation. Held as state rather than shown
   * through a native dialog: a modal blocks the whole webview under Tauri, and the
   * user needs to read the counts before deciding.
   */
  readonly pendingImport: Option.Option<PendingImport>
  /** Reversible operations, newest first. Not persisted across a restart. */
  readonly undo: readonly UndoEntry[]
}

export type PendingImport = {
  readonly diff: ImportDiff
  readonly apply: () => Project
}
