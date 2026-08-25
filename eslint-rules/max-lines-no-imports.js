/**
 * Caps file length while ignoring `import` statements, blank lines and comment-only
 * lines. The built-in `max-lines` counts imports, which makes it unusable for a
 * codebase where heavy composition means many imports per small function.
 */
const collectIgnoredLines = (sourceCode) => {
  const ignored = new Set()
  for (const node of sourceCode.ast.body) {
    if (node.type !== 'ImportDeclaration') continue
    for (let l = node.loc.start.line; l <= node.loc.end.line; l += 1) ignored.add(l)
  }
  for (const comment of sourceCode.getAllComments()) {
    for (let l = comment.loc.start.line; l <= comment.loc.end.line; l += 1) ignored.add(l)
  }
  return ignored
}

export const maxLinesNoImports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Limit file length, excluding import, blank and comment lines.' },
    schema: [{ type: 'object', properties: { max: { type: 'integer', minimum: 1 } }, additionalProperties: false }],
    messages: {
      tooLong:
        'File has {{count}} effective lines (limit {{max}}). Imports, blanks and comments are not counted — this file does too much, split it.',
    },
  },
  create(context) {
    const max = context.options[0]?.max ?? 50
    return {
      'Program:exit'(node) {
        const sourceCode = context.sourceCode
        const ignored = collectIgnoredLines(sourceCode)
        const count = sourceCode.lines.filter(
          (text, index) => text.trim().length > 0 && !ignored.has(index + 1),
        ).length
        if (count <= max) return
        context.report({ node, messageId: 'tooLong', data: { count, max } })
      },
    }
  },
}
