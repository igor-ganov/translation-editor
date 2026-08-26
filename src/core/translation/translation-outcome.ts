/**
 * What one translation run achieved.
 *
 * Deliberately about the run and not about the document. An earlier version
 * counted the finished project, so a run that translated nothing and rejected
 * forty-four sentences still announced "Translated 73" — those seventy-three
 * were already there from an earlier attempt. It is assembled by `runTally`.
 */
export type TranslationOutcome = {
  readonly failed: number
  readonly translated: number
  /** What most of the failures said, so the message can name it rather than count it. */
  readonly reason: string | undefined
}
