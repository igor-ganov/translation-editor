import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'

/** Reports what actually occupies space inside the APK, largest group first. */
const apk = join(import.meta.dir, '..', 'dist-apk', 'translation-editor.apk')
const zip = await JSZip.loadAsync(readFileSync(apk))

const groupOf = (path: string): string => {
  switch (true) {
    case path.startsWith('lib/'):
      return `native: ${path.split('/')[1] ?? '?'}`
    case path.startsWith('assets/'):
      return 'web assets'
    case path.startsWith('res/') || path === 'resources.arsc':
      return 'android resources'
    case path.endsWith('.dex'):
      return 'java bytecode'
    default:
      return 'other'
  }
}

const sizes = new Map<string, number>()
const files: { path: string; bytes: number }[] = []

await Promise.all(
  Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map(async (entry) => {
      const bytes = (await entry.async('uint8array')).byteLength
      files.push({ path: entry.name, bytes })
      const key = groupOf(entry.name)
      sizes.set(key, (sizes.get(key) ?? 0) + bytes)
    }),
)

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

process.stdout.write('uncompressed by group:\n')
for (const [group, bytes] of [...sizes].sort((a, b) => b[1] - a[1])) {
  process.stdout.write(`  ${group.padEnd(22)} ${mb(bytes)}\n`)
}

process.stdout.write('\nten largest entries:\n')
for (const entry of files.sort((a, b) => b.bytes - a.bytes).slice(0, 10)) {
  process.stdout.write(`  ${mb(entry.bytes).padStart(9)}  ${entry.path}\n`)
}
