import { describe, expect, it } from 'vitest'
import { pushUndo } from './push-undo.js'
import { undoLimit } from './undo-limit.js'
import type { UndoEntry } from './types.js'
import { buildProject } from '../../../tests/support/build-project.js'

const project = buildProject({ blocks: [{ text: 'One thing happened.' }] })
const entry = (label: string): UndoEntry => ({ label, project })

describe('pushUndo', () => {
  it('puts the newest operation first, so undo reverses the last thing done', () => {
    const stack = pushUndo(pushUndo([])(entry('merge')))(entry('import'))
    expect(stack.map((item) => item.label)).toStrictEqual(['import', 'merge'])
  })

  it('discards the oldest entry once the bound is reached', () => {
    const filled = Array.from({ length: undoLimit + 5 }, (_unused, index) => index).reduce<
      readonly UndoEntry[]
    >((stack, index) => pushUndo(stack)(entry(`op ${String(index)}`)), [])
    expect(filled).toHaveLength(undoLimit)
    expect(filled[0]?.label).toBe(`op ${String(undoLimit + 4)}`)
  })

  it('keeps the project exactly as it was, so undo restores it whole', () => {
    const [top] = pushUndo([])(entry('merge'))
    expect(top?.project).toStrictEqual(project)
  })
})
