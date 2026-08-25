import { defineConfig } from 'astro/config'

// The Tauri CLI sets TAURI_DEV_HOST to the LAN address when running on a device,
// so the Android WebView can reach the dev server.
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  output: 'static',
  server: { port: 4321, host: host || false },
  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
      hmr: host ? { protocol: 'ws', host, port: 4322 } : undefined,
      watch: { ignored: ['**/src-tauri/**'] },
    },
    build: { target: 'es2022', sourcemap: true },
  },
})
