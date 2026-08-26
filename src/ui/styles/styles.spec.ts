/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest'

const modules: Record<string, Record<string, unknown>> = import.meta.glob('./*-styles.ts', { eager: true })

const cssTextOf = (value: unknown): string =>
  value instanceof Object && 'cssText' in value ? String(value.cssText) : ''

const flatten = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value.flat(9) : [value])

/**
 * A backtick inside a `css` template closes the template, and everything after
 * it becomes JavaScript. It still type-checks, it still builds, and it fails at
 * run time with "is not a function" and a blank screen. That has now happened
 * twice, so it is a test rather than something to remember.
 */
describe('stylesheets', () => {
  it('found the stylesheets', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(10)
  })

  it.each(Object.keys(modules))('%s exports usable CSS', (name) => {
    const exported = Object.values(modules[name] ?? {}).flatMap(flatten)
    expect(exported.length).toBeGreaterThan(0)
    for (const value of exported) expect(cssTextOf(value).length).toBeGreaterThan(0)
  })
})
