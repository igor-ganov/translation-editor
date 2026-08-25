# Translation Editor

A mobile-first editor for translating `.docx` documents segment by segment, built
as an Android APK and a desktop app from one codebase.

Load a Word document; it is split into paragraphs and, inside each paragraph, into
sentences. Both levels can carry a translation, and **a paragraph translation, when
present, overrides its sentences** — so a translator can restructure a paragraph
freely where a literal sentence-by-sentence rendering would read badly, and keep the
granular view everywhere else. Translations come from an LLM provider of your choice
or from an external tool via a plain-text round trip. Approve segments as you check
them, watch the progress bar, and export a finished `.docx`.

## Getting started

```bash
bun install
bun run dev          # browser, http://localhost:4321
bun run tauri dev    # desktop app
```

Android needs the Android SDK, the NDK, `JAVA_HOME`, `ANDROID_HOME`, `NDK_HOME`, and
the four Rust targets (`aarch64-linux-android`, `armv7-linux-androideabi`,
`i686-linux-android`, `x86_64-linux-android`):

```bash
bun run tauri android init
bun run tauri android dev
bun run tauri android build --apk
```

## Verifying

```bash
bun run verify   # types, lint, unit tests
bun run e2e      # Playwright, phone and desktop viewports
```

## Using it

**Import.** Pick a `.docx`. Headings, lists, tables and inline bold/italic/underline
are preserved. Sentence boundaries come from the platform segmenter plus a
per-language pass for abbreviations, so `Dr. Ellison`, `г. Москва` and `Sig. Rossi`
are not split. Where it still gets one wrong, **Merge next** and **Split here** fix
the boundary by hand; both are undoable.

**Translate.** Configure a provider in Settings — Anthropic, OpenAI, Gemini, Ollama
or llama.cpp — with your own API key, then press **Translate**. Work is sent in
batches, each batch is saved the moment it lands, and cancelling keeps everything
already finished. A batch whose reply drops, merges or invents a segment id is
rejected whole rather than written half-right.

Everything except translation itself works with no provider and no network.

**Review.** Edit any translation in place; editing clears its approval, because the
approved text no longer exists. Tick **Approved** per sentence, or per paragraph to
cover all of its sentences at once. The header shows how much is approved and how
much is translated at all, and **Next unapproved** jumps to the next thing to check.

**Paragraph override.** Type into the paragraph field to replace the whole paragraph.
The sentence translations are kept, not deleted — **Use sentences** brings them back.

**Export.** *Export .docx* writes the translated document, reporting how many
paragraphs kept their source text. *Export markup* writes two plain-text files with
a `⟦b12.s3⟧` marker before every segment: translate the source file anywhere you
like, then *Import markup* to bring it back. Before anything is written you see
exactly what will be added, changed, and which approvals it would cost.

## The markup format

```
#!translation-editor v1
#!doc 3f9a2c1e8b4d6072
#!lang en>ru
#!kind translation

⟦b0⟧
⟦b0.s0⟧Dr. Ellison had waited thirty years.
⟦b0.s1⟧The signal was faint but unmistakable.
```

Everything from one marker to the next belongs to that segment, so multi-line text
needs no escaping. A `⟦b0⟧` line with nothing after it is the slot for a paragraph
override — type into it to replace the whole paragraph. A line of content that
genuinely starts with `⟦` is written `⟦⟦`. The header identifies the document, so an
import onto the wrong one is caught and warned about.

## Documentation

- [`specs/translation-editor/requirements.md`](specs/translation-editor/requirements.md) — what it must do, as testable criteria
- [`specs/translation-editor/design.md`](specs/translation-editor/design.md) — how it is built, and what was rejected
- [`specs/translation-editor/tasks.md`](specs/translation-editor/tasks.md) — the build order and what verifies each step
