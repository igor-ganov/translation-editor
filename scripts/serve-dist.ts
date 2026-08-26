import { file } from 'bun'
import { join } from 'node:path'

const root = join(import.meta.dir, '..', 'dist')
const port = Number(process.env['PORT'] ?? 4323)

const wantsHtml = (request: Request): boolean =>
  request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html')

/**
 * A canned refusal in the shape a real service sends one, for the end-to-end
 * test of the failure path. Copied from the body that ended a real run, so the
 * test proves the readable sentence is lifted out of the envelope rather than
 * printed with it.
 */
const REFUSAL = JSON.stringify({
  type: 'error',
  error: {
    type: 'invalid_request_error',
    message: 'Your credit balance is too low to access the Anthropic API.',
  },
  request_id: 'req_test',
})

/**
 * A foreground static server for the built output.
 *
 * `astro preview` daemonises itself, which makes Playwright's `webServer` think
 * the process died; this stays in the foreground and exits with the test run.
 *
 * The single-page fallback applies only to navigations. Answering every unknown
 * path with the index made a POST to a made-up endpoint return a page with a 200
 * on it, which is a confusing thing for a test about refused requests to see —
 * and serving a file body to a POST crashed the server outright.
 */
Bun.serve({
  port,
  async fetch(request) {
    const path = new URL(request.url).pathname
    switch (path.startsWith('/refusing-service')) {
      case true:
        return new Response(REFUSAL, { status: 400, headers: { 'content-type': 'application/json' } })
      case false:
        break
    }
    const candidate = file(join(root, path === '/' ? 'index.html' : path))
    const found = request.method === 'GET' && (await candidate.exists())
    switch (found) {
      case true:
        return new Response(candidate, { headers: { 'cache-control': 'no-store' } })
      case false:
        return wantsHtml(request)
          ? new Response(file(join(root, 'index.html')), { headers: { 'cache-control': 'no-store' } })
          : new Response('not found', { status: 404 })
    }
  },
})

process.stdout.write(`serving dist on http://localhost:${String(port)}\n`)
