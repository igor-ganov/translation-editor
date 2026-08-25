import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Inlines the stylesheet and the SVG filters into every mockup.
 *
 * A mockup gets opened from a chat attachment, a download folder, a phone —
 * anywhere but next to its assets. Linked externally it arrives unstyled, which
 * is worse than useless: it looks like the design is the browser default.
 * `color-scheme: light` is forced for the same reason, so a phone in dark mode
 * does not repaint the paper black and leave the ink black with it.
 */
const source = join(import.meta.dir, 'mockups')
const target = join(import.meta.dir, 'standalone')

const css = await readFile(join(source, 'paper.css'), 'utf8')
const svg = await readFile(join(source, 'rough.svg'), 'utf8')
const filters = svg.replace(/<\?xml[^>]*\?>\s*/, '').trim()

await mkdir(target, { recursive: true })

const pages = (await readdir(source)).filter((name) => name.endsWith('.html'))

const inline = (html: string): string =>
  html
    .replace('<link rel="stylesheet" href="paper.css">', `<style>\n${css}\n</style>`)
    .replaceAll('url(rough.svg#', 'url(#')
    .replace('<body>', `<body>\n${filters}\n`)
    .replace('<meta name="viewport"', '<meta name="color-scheme" content="light">\n<meta name="viewport"')

await Promise.all(
  pages.map(async (name) => {
    const html = await readFile(join(source, name), 'utf8')
    const built = inline(html)
    const leftovers = /href="paper\.css"|rough\.svg#/.exec(built)
    if (leftovers) throw new Error(`${name} still refers to an external asset: ${leftovers[0]}`)
    await writeFile(join(target, name), built, 'utf8')
    process.stdout.write(`${name.padEnd(24)} ${String(Math.round(built.length / 1024))} kB, self-contained\n`)
  }),
)
