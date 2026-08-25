import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { heading, makeDocx, paragraph, run } from '../../support/make-docx.js'

/**
 * A small document with the shapes that matter: a heading, a two-sentence
 * paragraph, and an abbreviation the segmenter must not split on.
 */
export const fixtureBody = [
  paragraph(run('The Silent Observer'), heading(1)),
  paragraph(run('Dr. Ellison had waited thirty years. The signal was faint but unmistakable.')),
  paragraph(run('She reached for the console.')),
].join('')

/**
 * Written to a fresh directory per call: the suite runs in parallel workers, and
 * a shared path lets one worker read a file another is still writing.
 */
export const makeFixtureDocx = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'te-fixture-'))
  const path = join(directory, 'sample.docx')
  await writeFile(path, await makeDocx(fixtureBody))
  return path
}
