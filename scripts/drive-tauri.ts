/**
 * Drives the running Tauri window over the WebView2 debugging protocol.
 *
 * This is the only way to exercise the real transport: inside the app,
 * `isTauri()` is true, so requests go through `@tauri-apps/plugin-http` into
 * Rust — a path no browser test and no Node script can reach.
 */
const endpoint = process.env['CDP'] ?? 'http://127.0.0.1:9333'
const expression = process.env['EXPR'] ?? '1 + 1'

const targets: readonly { webSocketDebuggerUrl: string; url: string }[] = await fetch(
  `${endpoint}/json/list`,
).then((response) => response.json())

const page = targets.find((target) => target.url.includes('localhost:4321'))
if (page === undefined) throw new Error('the Tauri window is not open')

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

const result = await new Promise<unknown>((resolve, reject) => {
  const timer = setTimeout(() => {
    reject(new Error('no reply from the page within 120s'))
  }, 120_000)
  socket.addEventListener('message', (event) => {
    const message: { id?: number; result?: { result?: { value?: unknown } } } = JSON.parse(String(event.data))
    if (message.id !== 1) return
    clearTimeout(timer)
    resolve(message.result?.result?.value)
  })
  socket.send(
    JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression, awaitPromise: true, returnByValue: true, userGesture: true },
    }),
  )
})

process.stdout.write(`${JSON.stringify(result, undefined, 2)}\n`)
socket.close()
