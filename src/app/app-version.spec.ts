import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { appVersion } from './app-version.js'

const Versioned = Schema.Struct({ version: Schema.String })

const readVersion = (relative: string): string =>
  Schema.decodeUnknownSync(Versioned)(
    JSON.parse(readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')),
  ).version

describe('appVersion', () => {
  // It went unbumped through two releases, so an exported log reported 0.1.0 for
  // three different builds and no report could be matched to the code that made it.
  it('matches the version the package is published under', () => {
    expect(appVersion).toBe(readVersion('../../package.json'))
  })

  it('matches the version the Android package is built under', () => {
    expect(appVersion).toBe(readVersion('../../src-tauri/tauri.conf.json'))
  })
})
