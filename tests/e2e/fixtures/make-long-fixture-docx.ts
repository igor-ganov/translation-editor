import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { makeDocx, paragraph, run } from '../../support/make-docx.js'

/**
 * Nine two-sentence paragraphs, which is three pages at the current budget.
 *
 * Every paragraph opens with a different word so the contents lines are told
 * apart by their titles rather than by their position.
 */
export const LONG_OPENINGS: readonly string[] = [
  'Alpha begins the argument.',
  'Bravo continues it.',
  'Charlie complicates matters.',
  'Delta restates the position.',
  'Echo answers the objection.',
  'Foxtrot concedes a point.',
  'Golf returns to the thread.',
  'Hotel draws things together.',
  'India closes the section.',
]

export const longFixtureBody = LONG_OPENINGS.map((opening) =>
  paragraph(run(`${opening} A second sentence follows it.`)),
).join('')

/** A fresh directory per call: the suite runs in parallel workers. */
export const makeLongFixtureDocx = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'te-long-fixture-'))
  const path = join(directory, 'long.docx')
  await writeFile(path, await makeDocx(longFixtureBody))
  return path
}
