import { ooxml } from './ooxml.js'
import { elementsNamed } from './elements-named.js'
import type { Run } from '../../core/document/types.js'

const flagOn = (properties: readonly Element[], name: string): boolean =>
  properties.flatMap((element) => elementsNamed(element, name)).length > 0

const withoutPrefix = (nodeName: string): string => nodeName.replace(/^[^:]+:/, '')

/** Text a run contributes, with tabs and soft breaks rendered as whitespace. */
const runText = (run: Element): string =>
  Array.from(run.childNodes)
    .map((node) => {
      switch (withoutPrefix(node.nodeName)) {
        case ooxml.text:
          return node.textContent ?? ''
        case ooxml.tab:
          return '\t'
        case ooxml.break:
          return '\n'
        default:
          return ''
      }
    })
    .join('')

/**
 * Flattens a paragraph's runs into plain text plus formatting ranges over it.
 * Offsets are absolute in the paragraph, which is what lets a sentence range be
 * mapped back onto its formatting when the document is rebuilt.
 */
export const readRuns = (paragraph: Element): { readonly text: string; readonly runs: readonly Run[] } =>
  elementsNamed(paragraph, ooxml.run).reduce<{ text: string; runs: readonly Run[] }>(
    (accumulated, run) => {
      const text = runText(run)
      const properties = elementsNamed(run, ooxml.runProperties)
      return {
        text: accumulated.text + text,
        runs: [
          ...accumulated.runs,
          {
            start: accumulated.text.length,
            end: accumulated.text.length + text.length,
            bold: flagOn(properties, ooxml.bold),
            italic: flagOn(properties, ooxml.italic),
            underline: flagOn(properties, ooxml.underline),
          },
        ],
      }
    },
    { text: '', runs: [] },
  )
