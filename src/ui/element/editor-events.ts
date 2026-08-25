/** Actions the editor asks the application shell to perform. */
export const editorEvents = {
  filterChange: 'te-filter-change',
  translate: 'te-translate',
  cancelTranslate: 'te-cancel-translate',
  exportDocx: 'te-export-docx',
  exportMarkup: 'te-export-markup',
  importMarkup: 'te-import-markup',
  nextUnapproved: 'te-next-unapproved',
  undo: 'te-undo',
  exportLog: 'te-export-log',
  dismissNotice: 'te-dismiss-notice',
  openSettings: 'te-open-settings',
  closeProject: 'te-close-project',
  cursorMove: 'te-cursor-move',
} as const
