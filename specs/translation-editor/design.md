# Design — Translation Editor

**Status:** Draft, awaiting review (Phase 2 of 3)
**Satisfies:** `requirements.md` R1–R13

---

## 1. Technology decisions

| Concern | Choice | Why, and what was rejected |
|---|---|---|
| Shell | **Tauri 2.11** | Single codebase → Android APK + desktop (R12.1). Rejected Capacitor (no desktop story) and Electron (no Android). |
| Site framework | **Astro 7, `output: 'static'`** | Tauri requires a static host; Astro ships one HTML shell with near-zero framework runtime. SSR adapters are forbidden here. |
| UI components | **Lit 3** | Native custom elements, tiny runtime (matters for APK size and mid-range Android), no VDOM. |
| Language / effects | **TypeScript + Effect-TS** | Errors and absence become values (`Effect`, `Option`, `Either`), matching the project's functional rules. Boundary validation via `effect/Schema`. |
| Runtime / package manager | **bun** | Project default. |
| `.docx` parsing | **`jszip` + native `DOMParser`** | Only option giving a real paragraph/run model rather than an HTML blob. ~27 KB gz, no Node polyfills, works in Android WebView. Rejected `mammoth` (123 KB gz, HTML-first, structure must be reverse-engineered), `docx-preview` (renders to DOM, no stable model), `docx4js` (unmaintained, jszip 2.x). |
| `.docx` generation | **`docx` 9.7 (dolanmiu)** | MIT, active, correct `styles.xml`/`numbering.xml`/`sectPr` emission. Rejected `html-docx-js` (abandoned 2016, emits altChunk that only desktop Word opens) and hand-rolled OOXML (we would re-implement styles and numbering for no gain). |
| Sentence segmentation | **`Intl.Segmenter` + a per-locale abbreviation post-pass** | Baseline in every Chromium WebView, zero bundle cost, contiguous and lossless. Its one systematic error class (abbreviation + capitalised word) is fixed by a small pure post-pass, and R13 gives the user manual override. Rejected `sbd` / `compromise` / `wink-nlp` (English-centric), `sentence-splitter` (JA/EN), `cldr-segmentation` (unmaintained). |
| LLM transport | **`@tauri-apps/plugin-http` in Tauri; `fetch` in the browser** | The plugin's fetch runs through Rust/reqwest, so CORS does not apply — required because OpenAI and Gemini do not reliably serve permissive CORS from a `tauri://localhost` origin. |
| Persistence | **IndexedDB for project data; `@tauri-apps/plugin-store` for settings** | Projects reach tens of MB — `plugin-store` is a JSON file rewritten wholesale, wrong for that. IndexedDB is present in the Android WebView and in the browser, giving one implementation for both (R12.2). |

### 1.1 Critical platform pitfalls (from research; each becomes a task-level check)

- `Packer.toBuffer()` from `docx` throws in a WebView — **always `Packer.toBlob()`**.
- `plugin-window-state` is **desktop-only**, gated `#[cfg(desktop)]` in Rust. R11.4 therefore applies only to desktop; the JS call site is behind a capability check, not a try/catch.
- `plugin-dialog` on Android returns **`content://` URIs**, not paths; these can be passed straight to `plugin-fs` `readFile`/`writeFile`. There is **no folder picker** on Android.
- Anthropic needs `anthropic-version: 2023-06-01`, and — for the browser fallback only — `anthropic-dangerous-direct-browser-access: true`.
- Keep every binary path on `ArrayBuffer`/`Uint8Array`/`Blob`; never touch a `Buffer` code path.

---

## 2. Architecture

Ports-and-adapters. The **core** is pure and platform-free; the **shell** is the only place with effects.

```
src/
  core/                    pure, no I/O, 100% unit-tested
    document/              blocks, sentences, segment IDs
    segmentation/          Intl.Segmenter + abbreviation post-pass
    translation/           effective-translation rule, batching, ID reconciliation
    approval/              approval cascade, progress arithmetic
    markup/                markup serialiser + parser
    boundaries/            sentence merge / split
    undo/                  operation log
  ports/                   interface definitions only (no implementations)
    storage-port.ts
    file-port.ts
    provider-port.ts
    http-port.ts
  adapters/                the imperative shell
    docx/                  parse (jszip+DOMParser), build (docx lib)
    providers/             anthropic | openai | gemini | ollama | llamacpp
    platform/tauri/        dialog+fs, store, window-state, plugin-http
    platform/browser/      <input type=file>, download, localStorage, fetch
    storage/indexeddb/
  ui/                      Lit elements + their free-function behaviour modules
  app/                     composition root: wires ports to adapters once
```

**Dependency rule:** `core` imports nothing from `adapters` or `ui`. `ui` imports `core` and `ports`, never `adapters`. `app` is the only module that imports `adapters`.

**Platform selection** happens once, in `app`, via `isTauri()` from `@tauri-apps/api/core`, with the Tauri adapter modules behind a dynamic `import()` so the browser bundle never evaluates them.

### 2.1 Conformance to the project's functional rules

Every `core` file: one exported function, filename = function name in kebab-case, ≤50 lines excluding imports, no `if`, no ternary, no logical control flow. Choice is expressed with exhaustive `switch`, `effect/Match`, strategy lookup maps (`Record<Key, Fn>`), or `Option`/`Either`/`Effect` `match`. Lit elements hold only reactive properties, `@query` refs, one controller field, and one-line delegating lifecycle methods; all behaviour sits in free functions taking the host. ESLint enforces this in CI (§9).

---

## 3. Data model

```ts
type BlockKind =
  | { readonly tag: 'paragraph' }
  | { readonly tag: 'heading'; readonly level: 1|2|3|4|5|6 }
  | { readonly tag: 'listItem'; readonly ordered: boolean; readonly depth: number }
  | { readonly tag: 'tableCell'; readonly row: number; readonly column: number }

type Run = {
  readonly text: string
  readonly bold: boolean
  readonly italic: boolean
  readonly underline: boolean
}

type Sentence = {
  readonly id: SentenceId          // 'b12.s3'
  readonly start: number           // offset into the block's plain text
  readonly end: number             // exclusive
}

type Block = {
  readonly id: BlockId             // 'b12'
  readonly kind: BlockKind
  readonly text: string            // plain text; the single source of truth
  readonly runs: readonly Run[]    // formatting, offsets align to `text`
  readonly sentences: readonly Sentence[]
  readonly translatable: boolean   // false for empty / image-only blocks (R1.4)
}

type TranslationState =
  | { readonly tag: 'absent' }
  | { readonly tag: 'machine'; readonly text: string }
  | { readonly tag: 'edited'; readonly text: string }
  | { readonly tag: 'failed'; readonly reason: string }

type Entry = {
  readonly translation: TranslationState
  readonly approved: boolean
}

type Project = {
  readonly id: ProjectId
  readonly name: string
  readonly documentHash: string          // SHA-256 of the source .docx bytes
  readonly source: readonly Block[]
  readonly languages: { readonly from: LanguageTag; readonly to: LanguageTag }
  readonly entries: ReadonlyMap<SegmentId, Entry>   // keyed by block OR sentence id
  readonly nextSentenceOrdinal: ReadonlyMap<BlockId, number>  // R13.6, IDs never reused
  readonly cursor: SegmentId | undefined // last position, for R11.3
}
```

### 3.1 Why sentences are offsets, not strings

A `Sentence` stores `[start, end)` into `Block.text` instead of its own copy of the text. This makes R13.3 — "the concatenation of a block's sentences always equals the block's source text" — a structural invariant rather than something to test for: merge is `{start: a.start, end: b.end}`, split is a single offset. It also makes it trivial to map a sentence back onto the `runs` array when rendering formatting.

### 3.2 Segment IDs (R1.3, R13.6)

`b<n>` for blocks, `b<n>.s<m>` for sentences. `n` is the block's original import index and never changes. `m` comes from a per-block monotonic counter (`nextSentenceOrdinal`) — **not** the sentence's position. So splitting `b4.s2` in a block that has used ordinals 0–5 produces `b4.s2` (first half, keeps its ID and translation per R13.5) and `b4.s6`; retired IDs are never reissued. Sentence *order* comes from the array, never from the ID.

### 3.3 The central rule: effective translation (R5)

```ts
// core/translation/effective-translation.ts
const effectiveTranslation = (project: Project) => (block: Block): Option<string> =>
  pipe(
    blockOverride(project, block.id),        // Option<string>, non-empty block translation
    Option.orElse(() => sentenceComposite(project, block))
  )
```

Block translation wins whenever it is present and non-empty (R5.2); otherwise sentence translations are joined in order (R5.3). Sentence translations are **never deleted** when an override exists (R5.4), so removing the override restores them (R5.5). This function is the most-tested unit in the codebase — every export, progress figure and UI badge derives from it.

---

## 4. Markup format (R9, R10)

Plain UTF-8 text, extension `.tmarkup.txt`.

```
#!translation-editor v1
#!doc 3f9a2c1e8b4d6072
#!lang en>ru
#!kind translation

⟦b0⟧The Silent Observer
⟦b1⟧
⟦b1.s0⟧Dr. Ellison had waited thirty years for this moment.
⟦b1.s1⟧The signal was faint but unmistakable.
```

**Marker `⟦id⟧`** uses U+27E6/U+27E7 (mathematical white square brackets): valid UTF-8, survives copy-paste through editors and chat clients, and effectively never occurs in prose (R9.3). Markers sit at line start; everything from the marker to the next marker is that segment's text, so multi-line segments work without escaping.

A `⟦b1⟧` line with empty content, followed by its `⟦b1.s*⟧` lines, means "no block-level override, see the sentences" — the block line is always emitted so the external translator can supply an override by simply typing into it. This is what makes the paragraph-override rule (R5) usable from an external tool.

The header carries format version, document hash (matched against `Project.documentHash` for R10.2), language pair, and whether this is the source or the translation side. The format is deliberately line-oriented and hand-editable (R9.5).

**Import** (R10) is a pure parse into `ReadonlyMap<SegmentId, string>`, then a pure **diff** producing `{ added, changed, unchanged, unknownIds, missingIds, approvalsToClear }`. The UI shows this diff and applies nothing until confirmed (R10.5); applying is one undoable operation (R10.8). Parse errors carry the 1-based line number of the first problem (R10.7).

---

## 5. Translation pipeline (R4)

```
untranslated segments
  → chunk by token budget (core/translation/plan-batches.ts, pure)
  → for each batch, sequentially:
      buildPrompt (pure) → provider.translate (Effect) → reconcile (pure) → persist (Effect)
```

- **Batching** groups sentences by block so a batch never splits a paragraph, and includes the preceding and following sentence as untranslated context. Target ~2 000 source tokens per batch.
- **Reconciliation (R4.2)** compares returned IDs against requested IDs as sets. Any missing or extra ID rejects the whole batch — this is the safety net that schema-enforced JSON cannot provide, and it matters most with small local models.
- **Retry (R4.5)** is `Effect.retry` with exponential backoff + jitter, bounded to 4 attempts, and only on a `Transient` error (network, 429, 5xx). `Auth` and `BadRequest` errors fail immediately.
- **Persist-per-batch (R4.3, R4.4)** means cancellation or a process kill costs at most one batch; the next run recomputes "untranslated" from stored state and resumes there.
- **R4.7** is enforced in the plan step: segments whose `TranslationState` is `edited`, or which are approved, are excluded from the work list unless the user explicitly requested re-translation.

### 5.1 Provider port

```ts
type TranslationProvider = {
  readonly id: ProviderId
  readonly listModels: () => Effect<readonly string[], ProviderError>
  readonly translate: (req: TranslateRequest) => Effect<readonly Segment[], ProviderError>
}
type ProviderError =
  | { readonly tag: 'transient'; readonly status?: number; readonly message: string }
  | { readonly tag: 'auth'; readonly message: string }
  | { readonly tag: 'badRequest'; readonly message: string }
  | { readonly tag: 'malformedResponse'; readonly message: string }
```

Five adapters implement it as curried factories `(config) => (httpPort) => TranslationProvider`. All five request schema-constrained JSON `{ segments: [{ id, text }] }`; the per-provider differences stay inside the factory:

| | Endpoint | Auth | Max-tokens field | Structured output | Text path |
|---|---|---|---|---|---|
| Anthropic | `POST /v1/messages` | `x-api-key` + `anthropic-version` | `max_tokens` (required) | tool with `strict: true` | `content[0]` |
| OpenAI | `POST /v1/chat/completions` | `Authorization: Bearer` | `max_completion_tokens` | `response_format.json_schema`, `strict` | `choices[0].message.content` |
| Gemini | `POST /v1beta/models/{m}:generateContent` | `x-goog-api-key` | `generationConfig.maxOutputTokens` | `responseSchema` (OpenAPI subset) | `candidates[0].content.parts[0].text` |
| Ollama | `POST /api/chat` | none | `options.num_predict` | `format` = JSON Schema | `message.content` |
| llama.cpp | `POST /v1/chat/completions` | optional Bearer | `max_tokens` | `response_format.json_schema` | `choices[0].message.content` |

The JSON schema is declared once in TypeScript and **mapped per provider** — OpenAI and llama.cpp strict mode demand `additionalProperties: false` on every object, Gemini accepts only an OpenAPI subset. Responses are validated with `effect/Schema` at the adapter boundary, so a malformed reply becomes a typed `malformedResponse` error rather than a runtime surprise.

Streaming is deliberately **not** in the port: it buys nothing for schema-constrained batch translation and differs wildly across the five providers. If live preview is wanted later it arrives as an optional separate capability.

### 5.2 Credential storage (R3.3)

Keys go in `plugin-store` on Tauri (app-private storage) and `localStorage` in the browser dev fallback, which is documented as insecure and shown as such in the UI. Keys are excluded from every export path by construction: the export functions in `core` receive a `Project`, and `Project` has no field for them.

---

## 6. Persistence (R11)

IndexedDB, one database per app, object stores:

| Store | Key | Contents |
|---|---|---|
| `projects` | `ProjectId` | metadata, languages, `documentHash`, `cursor` |
| `blocks` | `[ProjectId, BlockId]` | source blocks (written once at import, then only on R13 boundary edits) |
| `entries` | `[ProjectId, SegmentId]` | translation + approval — the hot, frequently written store |
| `docxBlobs` | `ProjectId` | original file bytes, for re-export fidelity |

Splitting `entries` into its own store keyed per segment is what makes R11.2 (save without an explicit action) and R11.5 (crash safety) cheap: an edit writes one small record in one transaction, never rewrites the project. IndexedDB transactions are atomic, so a kill mid-write leaves the previous value intact rather than a half-written document. Edits are debounced ~400 ms and flushed on `visibilitychange`/`pagehide` (which Android fires when backgrounding the app).

**Position restore (R11.3)** stores `cursor` — the Segment ID at the top of the viewport, throttled to ~1 s. On open, the virtualiser scrolls to that ID. Storing an ID rather than a pixel offset means the position survives font-size changes, rotation, and layout differences between phone and desktop.

**Window geometry (R11.4)** is `plugin-window-state`, registered under `#[cfg(desktop)]` and never called on Android.

---

## 7. UI design

### 7.1 Layout

Mobile-first (R6.2). One vertical list of blocks; each block renders its block-level pair, then its sentence pairs when expanded.

- **≤ 719 px (phone, default):** source above, translation below, full width. No horizontal scroll at 320 px. Approve control and status badge sit in a compact row under the translation, sized for touch (≥ 44 × 44 px targets).
- **≥ 720 px:** two columns, source left, translation right, aligned per segment row.

The breakpoint is a container query on the list, not a viewport media query, so the same components behave correctly inside a narrow desktop pane.

A sticky header carries the progress bar (R7.5, R7.6), the filter control (R6.7), and the "next unapproved" action (R7.8).

### 7.2 Segment states

Each pair shows exactly one state, driven by an exhaustive `switch` over `TranslationState` plus approval: **untranslated**, **machine-translated**, **edited**, **approved**, **failed**, and — on a block — **overriding its sentences** (R5.4). State is conveyed by icon *and* text, never by colour alone, and announced via `aria-describedby` (R6.8).

### 7.3 Virtualisation (R6.6)

20 000 sentence pairs cannot all live in the DOM. A windowing virtualiser renders only the visible range plus an overscan margin, using estimated heights refined by `ResizeObserver` as rows are measured. Collapsed blocks (R6.5) reduce the row count dramatically and are the default for blocks whose sentences are all approved.

### 7.4 Editing (R6.3)

`contenteditable` is avoided; each translation is an auto-growing `<textarea>` bound to the segment. Persist on blur and on a 400 ms idle debounce. Any edit sets `TranslationState.edited` and clears approval (R6.4) — one pure `applyEdit` function does both, so the two can never drift apart.

### 7.5 Accessibility (R6.8)

The list is a `role="list"` of `role="listitem"` pairs, each labelled with its Segment ID and state. Approval is a real `<input type="checkbox">` with a visible label. Full keyboard operation: tab through pairs, `Enter` to edit, `Ctrl+Enter` to approve and advance, `Escape` to leave the field. Focus is never trapped by the virtualiser — focused rows are pinned in the rendered window.

---

## 8. Export (R8)

```
Project → resolve effective translation per block (core)
        → map to docx-lib document model (core: pure, produces a description)
        → Packer.toBlob (adapter)
        → save via file-port (dialog + fs on Tauri, <a download> in the browser)
```

Block kind maps to `docx` constructs: heading → `HeadingLevel.HEADING_n`, list item → `numbering` reference with `level: depth`, table cell → `TableCell` reassembled into rows. Inline runs are re-applied where the translation is a single run; where a translated sentence has no unambiguous run mapping, the block's dominant formatting is applied — a documented, deliberate simplification, reported to the user only if it affects more than a threshold share of blocks.

Empty effective translations fall back to source text and are counted and reported before writing (R8.3). In *approved only* mode, unapproved blocks are emitted as source with a yellow highlight (R8.4). Cyrillic and accented Latin need no special handling (UTF-8 throughout), but the export sets a font with full Cyrillic coverage (R8.5).

---

## 9. Quality gates

- **Lint (CI-blocking):** `no-restricted-syntax` banning `IfStatement` and `ConditionalExpression` in `src/`; a custom `max-lines-no-imports` at 50; `eslint-plugin-functional` (`no-let`, `immutable-data`); `switch-exhaustiveness-check`; one-export-per-file with filename match; typescript-eslint with `any` and type assertions banned.
- **Unit tests:** every pure function in `core`, every branch of every `switch` (rule 6 of the functional standard). Property-based tests for the two round-trips that must be lossless: markup export → import, and sentence merge → split.
- **E2E (Playwright):** event-driven waits only, no timeouts; run against the browser build.
- **Performance tests:** import of a generated 2 000-block fixture within budget (R1.6); scroll of a 20 000-row list (R6.6).
- **Accessibility:** automated audit on the editor view plus a keyboard-only pass.
- **Build check:** desktop and `tauri android build --apk` both succeed in CI.

---

## 10. Traceability

| Requirement | Design section |
|---|---|
| R1 import & segmentation | §1 (jszip+DOMParser, Intl.Segmenter), §3 data model, §3.2 IDs |
| R2 language pair | §3 `Project.languages`, §1 segmentation |
| R3 provider config | §5.1 port, §5.2 credentials |
| R4 automatic translation | §5 pipeline |
| R5 paragraph override | §3.3 effective translation |
| R6 aligned view & editing | §7 |
| R7 approval & progress | §3.3, §7.1, §7.2 |
| R8 docx export | §8 |
| R9 markup export | §4 |
| R10 markup import | §4 |
| R11 persistence & position | §6 |
| R12 cross-platform | §1.1, §2 (ports/adapters, `isTauri` split) |
| R13 boundary edits | §3.1 offsets, §3.2 ID allocation |

---

## 11. Corrections made during implementation

Things the design got wrong, found by building it:

1. **`getElementsByTagNameNS` is not portable.** happy-dom returns nothing from it even when `namespaceURI` on the element is correct. All OOXML selection goes through `elementsNamed`, which filters on `localName` plus `namespaceURI` — this also works in every browser, so it is simply the better call.
2. **One IndexedDB connection, not one per operation.** Opening per call deadlocks: an `open` issued while another connection is still finishing its upgrade blocks, and under concurrent writes the two wait on each other. `openDatabase` memoises a single connection for the page lifetime and `transact` no longer closes it.
3. **Virtualised rows need an explicit width.** The virtualiser positions rows absolutely; a row with no width of its own collapses to zero and its text wraps one character per line. `:host` on both row components sets `width: 100%`.
4. **Cancellation is not a port concern.** `HttpRequest` carries no `AbortSignal`; each transport adapter wires its own `AbortController` to Effect interruption, so interrupting the fibre cancels the request without every caller threading a signal through.
5. **Startup effects must be suspended.** `restoreLastProject` read the stored project id when its pipeline was *assembled*, which is before settings have loaded. It is wrapped in `Effect.suspend`.
6. **No type assertions for event payloads.** Rather than casting `CustomEvent.detail`, the custom events are declared in a global `HTMLElementEventMap`, so `addEventListener` hands back a correctly typed detail and no listener asserts anything.

## 12. Review notes

Two points worth a decision before implementation:

1. **Run-level formatting on export (§8).** Mapping source inline formatting onto translated text is fundamentally ambiguous — the translation has different word boundaries. The design applies the block's dominant formatting when a clean mapping is unavailable. The alternative is to preserve formatting only for whole-block-uniform formatting and drop it otherwise. The chosen approach keeps more of the document's appearance at the cost of occasional misplaced emphasis.

2. **Effect-TS bundle cost.** Effect adds roughly 40–60 KB gz. For an APK this is acceptable and the project's rules mandate it; noting it once as required by the standard.

3. **Local providers on a LAN.** Tauri's HTTP capability scopes are fixed at build time, so the shipped scope allows the cloud hosts plus `localhost` and `127.0.0.1`. A user pointing Ollama or llama.cpp at another machine on their network will be blocked in the Tauri build (the browser build is unaffected). Widening the scope to the whole private address space would weaken the capability meaningfully; the alternative is a build-time option. Flagging rather than deciding.
