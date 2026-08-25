import { heading, makeDocx, paragraph, run } from './make-docx.js'

/**
 * Italian prose carrying the punctuation that actually breaks sentence
 * segmentation, which synthetic English fixtures never exercise: guillemets with
 * an attribution trailing the closing mark, nested curly quotes, curly
 * apostrophes, decimals, and abbreviations followed by a capitalised word.
 */
export const italianParagraphs: readonly string[] = [
  'Eccesso di capitale e sovrappopolazione',
  'Nell’epoca dell’automazione, il paradosso resta immutato. Il capitale eccedente e la popolazione eccedente convivono.',
  '«Senza teoria rivoluzionaria non c’è movimento rivoluzionario», recita l’assioma citato dal Dott. Bianchi in apertura.',
  'Il pensiero corrente attribuisce le crisi a “shock esterni”, ma il Sig. Rossi obietta che la causa è interna al sistema.',
  'Il saggio di profitto scende al 3.14 per cento. Nessuna riforma lo risolleva, ecc. Resta la distruzione dei valori.',
]

export const italianBody = [
  paragraph(run(italianParagraphs[0] ?? ''), heading(1)),
  ...italianParagraphs.slice(1).map((text) => paragraph(run(text))),
  paragraph(''),
].join('')

/** Built in memory, so no document belonging to anyone lives in the repository. */
export const italianFixture = async (): Promise<Uint8Array> => await makeDocx(italianBody)
