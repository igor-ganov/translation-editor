import { file } from 'bun'
import { join } from 'node:path'

const root = join(import.meta.dir, '..', 'dist')
const port = Number(process.env['PORT'] ?? 4323)

/**
 * A foreground static server for the built output.
 *
 * `astro preview` daemonises itself, which makes Playwright's `webServer` think
 * the process died; this stays in the foreground and exits with the test run.
 */
Bun.serve({
  port,
  async fetch(request) {
    const path = new URL(request.url).pathname
    const candidate = file(join(root, path === '/' ? 'index.html' : path))
    const found = await candidate.exists()
    return new Response(found ? candidate : file(join(root, 'index.html')), {
      headers: { 'cache-control': 'no-store' },
    })
  },
})

process.stdout.write(`serving dist on http://localhost:${String(port)}\n`)
