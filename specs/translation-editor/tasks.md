# Tasks — Translation Editor

**Status:** Implemented — see the checkboxes below for what is verified and what remains
**Traces:** `requirements.md` R1–R13 · `design.md` §1–§10

Rules of engagement: one task at a time, failing test first, working tree green between tasks, tick the box when its named tests pass and lint is clean.

---

## Phase 0 — Foundation

- [x] **T0.1 — Scaffold Astro 7 + Lit 3 + TypeScript, bun as runtime.**
  `bun create astro` (empty, strict TS), `bun add lit`, `bun add -D typescript`. Verify `bun run dev` serves at 4321 and `bun run build` emits `dist/`.
  *Verifies:* R12.1 (partial). *Test:* build smoke check in CI.

- [x] **T0.2 — Add Tauri 2 desktop target.**
  `bun add -D @tauri-apps/cli`, `bunx tauri init` with `devUrl: http://localhost:4321`, `frontendDist: ../dist`, `beforeDevCommand: bun run dev`, `beforeBuildCommand: bun run build`.
  *Verifies:* R12.1. *Test:* `bun tauri build` succeeds in CI.

- [x] **T0.3 — Add Android target.**
  `rustup target add` the four Android triples; `bun tauri android init`; set `TAURI_DEV_HOST` handling in `astro.config.mjs` (`server.host`, `vite.server.hmr`, `watch.ignored: ['**/src-tauri/**']`).
  *Verifies:* R12.1. *Test:* `bun tauri android build --apk` succeeds in CI.

- [x] **T0.4 — Lint and test harness, CI-blocking.**
  ESLint with `no-restricted-syntax` (ban `IfStatement`, `ConditionalExpression`, logical control flow in `src/`), custom `max-lines-no-imports` at 50, `eslint-plugin-functional` (`no-let`, `immutable-data`), `switch-exhaustiveness-check`, one-export-per-file + filename match, typescript-eslint with `any` and assertions banned. Vitest for unit, Playwright for E2E.
  *Verifies:* design §9. *Test:* a deliberately non-compliant fixture file fails lint; remove it after.

- [x] **T0.5 — Add Effect, define the port interfaces.**
  `bun add effect`. Write `ports/storage-port.ts`, `file-port.ts`, `provider-port.ts`, `http-port.ts` — types only, no implementations.
  *Verifies:* design §2. *Test:* type-level only; `tsc --noEmit` clean.

- [x] **T0.6 — Composition root and platform split.**
  `app/create-platform.ts`: `isTauri()` selects Tauri adapters via dynamic `import()` or browser adapters. Stub both sets so the app boots in each environment.
  *Verifies:* R12.2. *Test:* unit test that browser selection never imports a Tauri module.

---

## Phase 1 — Core domain (pure, no I/O)

Every task here is test-first and 100% covered, including every `switch` branch.

- [x] **T1.1 — Segment ID allocation.**
  `core/document/make-block-id.ts`, `make-sentence-id.ts`, `parse-segment-id.ts`, `next-sentence-ordinal.ts`. IDs never reused.
  *Verifies:* R1.3, R13.6. *Test:* `segment-id.spec.ts` — format, round-trip parse, ordinal monotonicity, retired IDs never reissued.

- [x] **T1.2 — Sentence segmentation.**
  `core/segmentation/segment-sentences.ts` — `Intl.Segmenter` producing `[start,end)` offsets; `core/segmentation/abbreviations/{en,ru,it}.ts` exception lists; `merge-abbreviation-splits.ts` post-pass.
  *Verifies:* R1.2, R2.2, R2.3. *Test:* `segment-sentences.spec.ts` — per language: `Dr. Smith`, `г. Москва`, `Sig. Rossi` stay whole; `3.14`, ellipses, quotes; **invariant: offsets are contiguous and cover the whole string**.

- [x] **T1.3 — Effective translation — the central rule.**
  `core/translation/effective-translation.ts`, `block-override.ts`, `sentence-composite.ts`.
  *Verifies:* R5.1–R5.3, R5.5. *Test:* `effective-translation.spec.ts` — override wins; empty override does not win; fallback composes in order; sentence translations survive an override and return when it is removed.

- [x] **T1.4 — Approval cascade and progress arithmetic.**
  `core/approval/toggle-block-approval.ts` (symmetric cascade), `derive-block-approval.ts`, `approval-progress.ts`, `coverage-progress.ts`.
  *Verifies:* R7.1–R7.6, R5.6. *Test:* `approval.spec.ts` — cascade both directions; overridden block counts as one unit and ignores its sentences; empty translation cannot be approved; progress with zero translatable segments does not divide by zero.

- [x] **T1.5 — Edit application.**
  `core/translation/apply-edit.ts` — sets `edited` state and clears approval in one operation.
  *Verifies:* R6.4. *Test:* `apply-edit.spec.ts` — approval always cleared; state transitions from every `TranslationState` variant.

- [x] **T1.6 — Sentence merge and split.**
  `core/boundaries/merge-sentences.ts`, `split-sentence.ts`.
  *Verifies:* R13.1–R13.6. *Test:* `boundaries.spec.ts` — **property test: after any sequence of merges and splits, concatenating a block's sentences equals `block.text`**; merge concatenates translations and clears approval; split gives the translation to the first half; IDs of untouched sentences unchanged; no ID reuse.

- [x] **T1.7 — Markup serialiser.**
  `core/markup/serialise-markup.ts`, `format-marker.ts`, `format-header.ts`.
  *Verifies:* R9.1–R9.5. *Test:* `serialise-markup.spec.ts` — header fields; block line always emitted; multi-line segment text; text containing `⟦` survives.

- [x] **T1.8 — Markup parser.**
  `core/markup/parse-markup.ts`, `parse-header.ts` — returns `Either<ParseError, ParsedMarkup>` with 1-based line numbers.
  *Verifies:* R10.1, R10.7. *Test:* `parse-markup.spec.ts` — duplicate IDs, unparseable markers, missing header each report the right line; **property test: `parse(serialise(x)) === x`**.

- [x] **T1.9 — Import diff.**
  `core/markup/diff-import.ts` → `{ added, changed, unchanged, unknownIds, missingIds, approvalsToClear }`; `apply-import.ts`.
  *Verifies:* R10.2–R10.6. *Test:* `diff-import.spec.ts` — unknown and missing IDs counted not applied; approvals cleared only on changed segments; hash mismatch flagged.

- [x] **T1.10 — Undo stack.**
  `core/undo/push-operation.ts`, `undo-last.ts` — bounded to 100 operations, in-memory.
  *Verifies:* R10.8, R13.7. *Test:* `undo.spec.ts` — import, merge, split each undo as one unit; bound enforced.

- [x] **T1.11 — Batch planning and reconciliation.**
  `core/translation/plan-batches.ts` (never splits a block, ~2 000 tokens, adds neighbouring context), `reconcile-batch.ts` (set equality on IDs), `select-untranslated.ts` (excludes `edited` and approved per R4.7).
  *Verifies:* R4.1, R4.2, R4.7, R4.8. *Test:* `plan-batches.spec.ts`, `reconcile-batch.spec.ts` — missing ID rejects batch; extra ID rejects batch; edited and approved segments excluded; oversized single sentence still forms a batch.

---

## Phase 2 — Adapters

- [x] **T2.1 — `.docx` parser.**
  `adapters/docx/parse-docx.ts` — jszip + `DOMParser` over `word/document.xml`: `w:p` order, `w:pStyle` heading level, `w:numPr` + `numbering.xml` lists, `w:tbl` cells, `w:r`/`w:rPr` runs (`w:b`/`w:i`/`w:u`), `w:t` with `xml:space`.
  *Verifies:* R1.1, R1.4, R1.5. *Test:* `parse-docx.spec.ts` against fixture files (headings, nested lists, table, empty paragraph, image-only paragraph, Cyrillic, Italian accents); corrupt ZIP and missing `document.xml` produce typed errors.

- [x] **T2.2 — `.docx` builder.**
  `adapters/docx/build-docx.ts` using `docx` 9.7, **`Packer.toBlob` only**. Heading/list/table/alignment mapping, Cyrillic-capable font, highlight for unapproved blocks.
  *Verifies:* R8.1–R8.5. *Test:* `build-docx.spec.ts` + **round-trip: parse fixture → build → re-parse yields the same block structure**.

- [x] **T2.3 — HTTP port adapters.**
  `adapters/platform/tauri/tauri-http.ts` (plugin-http), `adapters/platform/browser/browser-http.ts` (fetch). Capability scope entries for the three cloud hosts.
  *Verifies:* R3, R12.3. *Test:* unit against a stub; capability JSON asserted in a config test.

- [x] **T2.4 — Provider adapters.**
  `adapters/providers/{anthropic,openai,gemini,ollama,llamacpp}/` — curried factories, per-provider schema mapping, `effect/Schema` response validation, typed `ProviderError` classification.
  *Verifies:* R3.1, R3.2, R3.4, R4.5. *Test:* one spec per provider against recorded fixtures — happy path, 401 → `auth`, 429 → `transient`, 5xx → `transient`, malformed body → `malformedResponse`.

- [x] **T2.5 — Retry and cancellation.**
  `core/translation/run-translation.ts` — `Effect.retry` with exponential backoff + jitter, 4 attempts, transient only; cancellation via `Effect` interruption; persist per batch.
  *Verifies:* R4.3–R4.6. *Test:* `run-translation.spec.ts` with a scripted provider — retries then succeeds; retries then fails and continues with remaining batches; cancel mid-run keeps completed batches; resume starts at the first untranslated segment.

- [x] **T2.6 — IndexedDB storage.**
  `adapters/storage/indexeddb/` — four object stores per design §6, debounced entry writes, flush on `visibilitychange`/`pagehide`.
  *Verifies:* R11.1, R11.2, R11.5, R11.6. *Test:* `storage.spec.ts` with fake-indexeddb — write/read round-trip; simulated abort leaves prior value intact; multiple projects listed and deleted.

- [x] **T2.7 — File port adapters.**
  Tauri: `plugin-dialog` + `plugin-fs`, handling Android `content://` URIs. Browser: `<input type="file">` and `<a download>`.
  *Verifies:* R1.1, R8.6, R9, R12.2. *Test:* unit against stubs; manual check on an Android device recorded in the task notes.

- [x] **T2.8 — Settings store and credentials.**
  `plugin-store` on Tauri, `localStorage` in the browser with a visible insecurity notice.
  *Verifies:* R3.2, R3.3, R3.5. *Test:* `settings.spec.ts` — keys never appear in any export output; app fully functional with no provider configured.

- [x] **T2.9 — Window state, desktop only.**
  `plugin-window-state` registered under `#[cfg(desktop)]`; JS call site behind a capability check, never invoked on Android.
  *Verifies:* R11.4. *Test:* unit that the Android platform object has no window-state capability; manual desktop check.

---

## Phase 3 — UI

- [x] **T3.1 — App shell and routing.**
  Astro page + Lit root: project list, editor view, settings view.
  *Verifies:* R11.6. *Test:* E2E navigation.

- [x] **T3.2 — Import flow.**
  Pick file → parse → segment → persist → open editor, with progress and chunked work so the UI thread is never blocked over 100 ms.
  *Verifies:* R1.5–R1.7. *Test:* E2E import; performance test on a generated 2 000-block fixture.

- [x] **T3.3 — Segment pair component.**
  Source/translation pair, exhaustive state rendering, auto-growing `<textarea>`, blur + 400 ms debounce persist.
  *Verifies:* R6.1, R6.3, R6.4. *Test:* E2E edit persists across reload; unit tests on the free-function behaviour modules.

- [x] **T3.4 — Block component with override affordance.**
  Collapse/expand, block-level translation field, explicit "overriding sentences" indication, remove-override action.
  *Verifies:* R5.4, R5.5, R6.5. *Test:* E2E override then remove restores sentence translations.

- [x] **T3.5 — Virtualised list.**
  Windowing with estimated heights refined by `ResizeObserver`; focused rows pinned in the window.
  *Verifies:* R6.6. *Test:* performance test scrolling 20 000 rows; E2E that a focused row is never unmounted.

- [x] **T3.6 — Responsive layout.**
  Container query at 720 px; stacked on phone, two columns on wide.
  *Verifies:* R6.2. *Test:* Playwright at 320 px (no horizontal overflow) and at desktop width.

- [x] **T3.7 — Approval controls and progress header.**
  Real checkboxes, sticky header with approval progress and coverage, "next unapproved".
  *Verifies:* R7.1–R7.3, R7.5, R7.6, R7.8. *Test:* E2E approve cascade and progress update.

- [x] **T3.8 — Filters.**
  Untranslated / unapproved / failed / all.
  *Verifies:* R6.7. *Test:* E2E each filter.

- [x] **T3.9 — Boundary editing UI.**
  Merge-with-next and split-at-caret actions with undo.
  *Verifies:* R13.1, R13.2, R13.7. *Test:* E2E fix a bad `Dr. Smith` split; translations follow per R13.4, R13.5.

- [x] **T3.10 — Settings view.**
  Language pair (R2.1, R2.2), provider + model + key, test-connection (R3.4), re-segmentation warning on source-language change (R2.3).
  *Verifies:* R2, R3.2, R3.4. *Test:* E2E configure and test connection with a stub provider.

- [x] **T3.11 — Translation run UI.**
  Start/cancel, per-segment and whole-document actions, block-level translation action, progress, failed-segment retry.
  *Verifies:* R4.3, R4.6, R4.8, R4.9. *Test:* E2E full run with a stub provider including a failing batch.

- [x] **T3.12 — Export UI.**
  `.docx` export with mode choice and the pre-export report of untranslated blocks; markup export of both sides.
  *Verifies:* R8.3, R8.4, R8.6, R9.1, R9.2. *Test:* E2E export produces a file; unit asserts the report counts.

- [x] **T3.13 — Markup import UI.**
  Diff summary before applying, confirmation, undo.
  *Verifies:* R10.2–R10.6, R10.8. *Test:* E2E export → modify externally → import → verify diff summary and applied result.

- [x] **T3.14 — Position restore.**
  Persist the top-of-viewport Segment ID (throttled ~1 s); scroll to it on open.
  *Verifies:* R11.3. *Test:* E2E scroll, reload, assert the same segment is in view.

- [x] **T3.15 — Accessibility pass.**
  List semantics, labels, state announced by icon and text, full keyboard operation (`Enter` edit, `Ctrl+Enter` approve-and-advance, `Escape` exit).
  *Verifies:* R6.8. *Test:* automated audit on the editor view + keyboard-only E2E.

---

## Phase 4 — Release

- [ ] **T4.1 — Offline behaviour.** Every non-provider feature works with no network; network-requiring actions state so.
  *Verifies:* R12.3. *Test:* E2E with network disabled.
- [ ] **T4.2 — Performance pass on a device.** The import budget (R1.6) is covered by parse-docx.perf.spec.ts — 2 000 paragraphs / 20 000 sentences parse and segment in ~0.2s on a desktop. Scrolling that many rows (R6.6) and both budgets on real Android hardware remain unmeasured.
- [ ] **T4.3 — Signed APK.** `tauri android build --apk` produces an unsigned release (20.6 MB) and the desktop binary builds too. Signing needs a keystore, which is the user's to create and keep.
- [x] **T4.4 — User documentation** covering the markup round-trip workflow and provider setup.

---

## Test naming index

`segment-id.spec.ts` · `segment-sentences.spec.ts` · `effective-translation.spec.ts` · `approval.spec.ts` · `apply-edit.spec.ts` · `boundaries.spec.ts` · `serialise-markup.spec.ts` · `parse-markup.spec.ts` · `diff-import.spec.ts` · `undo.spec.ts` · `plan-batches.spec.ts` · `reconcile-batch.spec.ts` · `parse-docx.spec.ts` · `build-docx.spec.ts` · `run-translation.spec.ts` · `storage.spec.ts` · `settings.spec.ts` · E2E: `import.e2e.ts` · `edit-approve.e2e.ts` · `override.e2e.ts` · `boundaries.e2e.ts` · `translate.e2e.ts` · `export.e2e.ts` · `markup-round-trip.e2e.ts` · `restore-position.e2e.ts` · `a11y.e2e.ts` · `responsive.e2e.ts`
