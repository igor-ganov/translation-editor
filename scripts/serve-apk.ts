import { file } from 'bun'
import { join } from 'node:path'

const apk = join(import.meta.dir, '..', 'dist-apk', 'translation-editor.apk')
const port = Number(process.env['PORT'] ?? 8787)

/**
 * Hands the APK to a phone on the same network.
 *
 * The chat delivery channel truncates a file this size, so the download has to
 * come straight from here. `Content-Length` is set explicitly so the phone can
 * tell a complete download from a cut-off one.
 */
Bun.serve({
  port,
  hostname: '0.0.0.0',
  async fetch() {
    const payload = file(apk)
    return new Response(payload, {
      headers: {
        'content-type': 'application/vnd.android.package-archive',
        'content-length': String(payload.size),
        'content-disposition': 'attachment; filename="translation-editor.apk"',
        'cache-control': 'no-store',
      },
    })
  },
})

process.stdout.write(`serving ${String((await file(apk).size) / 1024 / 1024)} MB on port ${String(port)}\n`)
