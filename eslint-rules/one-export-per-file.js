import { basename, extname } from 'node:path'

const toCamelCase = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())

const namesOf = (node) => {
  switch (node.type) {
    case 'ExportNamedDeclaration':
      return node.declaration?.type === 'VariableDeclaration'
        ? node.declaration.declarations.map((d) => d.id.name)
        : node.declaration
          ? [node.declaration.id?.name]
          : node.specifiers.map((s) => s.exported.name)
    default:
      return []
  }
}

/** Value exports only — `export type` is free, since types are not the file's subject. */
const isValueExport = (node) =>
  node.type === 'ExportNamedDeclaration' &&
  node.exportKind !== 'type' &&
  !(node.declaration?.type === 'TSTypeAliasDeclaration') &&
  !(node.declaration?.type === 'TSInterfaceDeclaration')

export const oneExportPerFile = {
  meta: {
    type: 'suggestion',
    docs: { description: 'One value export per file; its name must match the filename.' },
    schema: [],
    messages: {
      tooMany: 'File exports {{count}} values ({{names}}). Export exactly one — split the rest into their own files.',
      nameMismatch: 'Exported value is `{{actual}}` but the filename implies `{{expected}}`. The filename IS the function name.',
    },
  },
  create(context) {
    return {
      'Program:exit'(node) {
        const exported = node.body.filter(isValueExport).flatMap(namesOf).filter(Boolean)
        if (exported.length === 0) return
        if (exported.length > 1) {
          context.report({ node, messageId: 'tooMany', data: { count: exported.length, names: exported.join(', ') } })
          return
        }
        const expected = toCamelCase(basename(context.filename, extname(context.filename)))
        const actual = exported[0]
        // A custom-element class is PascalCase by convention while its file is
        // kebab-case, so the first letter's case is not significant.
        if (actual.toLowerCase() === expected.toLowerCase()) return
        context.report({ node, messageId: 'nameMismatch', data: { actual, expected } })
      },
    }
  },
}
