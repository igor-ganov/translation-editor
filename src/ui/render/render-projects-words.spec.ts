import { describe, expect, it } from 'vitest'
import { renderProjectsCount } from './render-projects-count.js'
import { renderProjectsWords } from './render-projects-words.js'

describe('renderProjectsWords', () => {
  it('says nothing is settled rather than showing a bare zero', () => {
    expect(renderProjectsWords({ total: 117, translated: 91, approved: 0 })).toBe(
      '117 sentences · 91 drafted, none settled yet',
    )
  })

  it('says a finished document is finished', () => {
    expect(renderProjectsWords({ total: 8, translated: 8, approved: 8 })).toBe('8 sentences · all settled')
  })

  it('gives both counts while work is under way', () => {
    expect(renderProjectsWords({ total: 117, translated: 91, approved: 41 })).toBe(
      '117 sentences · 41 settled · 91 drafted',
    )
  })
})

describe('renderProjectsCount', () => {
  it('keeps a single document singular', () => {
    expect(renderProjectsCount(1)).toBe('1 document')
  })

  it('pluralises everything else, including none', () => {
    expect(renderProjectsCount(0)).toBe('0 documents')
    expect(renderProjectsCount(3)).toBe('3 documents')
  })
})
