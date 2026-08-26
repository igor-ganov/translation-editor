# Requirements — Translation Editor

**Status:** Draft, awaiting review (Phase 1 of 3)
**Scope:** whole application, first release (MVP+)

---

## 1. Overview

A mobile-first application for translating `.docx` documents with segment-level control.

The user loads a `.docx`, the app splits it into **paragraphs** and, inside each paragraph, into **sentences**. Both levels can carry a translation. Translations are produced by a pluggable LLM provider, or authored externally and imported. The user reviews translations side by side with the source, edits them, and marks each segment as **approved**. Progress is the share of approved segments. The finished translation is exported back to `.docx`.

The defining rule of the data model: **a paragraph-level translation is optional, but when present it overrides the sentence-level translations of that paragraph.** This lets a translator restructure a paragraph freely (merge, split, reorder sentences) where a literal sentence-by-sentence rendering would read badly, while keeping the granular sentence view available everywhere else.

### 1.1 Target platforms

- **Android APK** via Tauri 2 — the primary target, mobile-first UI.
- **Desktop** (Windows/macOS/Linux) via Tauri 2 — same codebase.
- **Plain browser** — used for development and as a fallback; features requiring native file access degrade gracefully.

### 1.2 Out of scope for this release

Translation memory and glossaries; multi-user collaboration and sync; OCR / PDF / scanned input; `.doc` (legacy binary) input; comments and tracked changes from the source document; images and embedded objects (preserved positionally, not translated).

---

## 2. Glossary

| Term | Meaning |
|---|---|
| **Document** | One imported `.docx` and everything derived from it. |
| **Block** | A top-level structural unit of the document: paragraph, heading, list item, or table cell. Ordered. Referred to as "paragraph" in the UI. |
| **Sentence** | A segment inside a block, produced by sentence segmentation. Ordered within its block. |
| **Segment** | A block or a sentence — anything that can carry a translation and an approval. |
| **Segment ID** | Stable, human-readable identifier of a segment, e.g. `b12` for a block, `b12.s3` for the third sentence of block 12. |
| **Effective translation** | The text used for a block on export: the block translation if it exists and is non-empty, otherwise the concatenation of its sentence translations. |
| **Markup file** | A plain-text export of the document where every segment is preceded by its Segment ID marker, used to round-trip through an external translation tool. |
| **Provider** | An implementation of the translation port (Anthropic, OpenAI, Gemini, Llama/local). |
| **Project** | The persisted state of one document: source, segments, translations, approvals, settings. |

---

## 3. User stories and acceptance criteria

Requirement IDs (`R1`…) are referenced by `design.md` and `tasks.md`.

---

### R1 — Import a `.docx` document

> As a user, I want to load a `.docx` file so the app can prepare it for translation.

**Acceptance criteria**

- **R1.1** — WHEN the user selects a `.docx` file THE SYSTEM SHALL parse it into an ordered list of blocks, preserving for each block its kind (paragraph / heading level 1–6 / list item / table cell), its plain text, and its inline formatting runs (bold, italic, underline).
- **R1.2** — WHEN a block is created THE SYSTEM SHALL segment its text into sentences using the source language's rules and store them as an ordered list.
- **R1.3** — WHEN segmentation runs THE SYSTEM SHALL assign every block and every sentence a stable Segment ID that does not change for the lifetime of the project.
- **R1.4** — WHERE a block contains no text (empty paragraph, image-only paragraph) THE SYSTEM SHALL keep the block in document order, mark it non-translatable, and produce zero sentences for it.
- **R1.5** — IF the selected file is not a valid `.docx` (wrong magic bytes, corrupt ZIP, missing `word/document.xml`) THEN THE SYSTEM SHALL abort the import, leave any currently open project untouched, and show an error naming the reason.
- **R1.6** — WHEN a document of up to 2 000 blocks / 20 000 sentences is imported on a mid-range Android device THE SYSTEM SHALL complete parsing and segmentation within 10 seconds and remain responsive (parsing must not block the UI thread for more than 100 ms at a time).
- **R1.7** — WHEN import succeeds THE SYSTEM SHALL persist the project so it survives an app restart without re-importing the file.

---

### R2 — Configure the language pair

> As a user, I want to choose the source and target language of the project.

- **R2.1** — WHEN a new project is created THE SYSTEM SHALL require a source language and a target language before translation can be requested.
- **R2.2** — THE SYSTEM SHALL offer at minimum English, Russian and Italian as both source and target, and SHALL be extensible to further languages without code changes to the UI.
- **R2.3** — WHEN the source language changes THE SYSTEM SHALL re-run sentence segmentation with the new language's rules and SHALL preserve existing translations for segments whose text is unchanged.
- **R2.4** — THE SYSTEM SHALL persist the language pair with the project.

---

### R3 — Configure the translation provider

> As a user, I want to pick which LLM service does the translating and supply my own credentials.

- **R3.1** — THE SYSTEM SHALL support at least four provider implementations behind one interface: Anthropic, OpenAI, Google Gemini, and a local/self-hosted Llama-compatible server.
- **R3.2** — WHEN a provider is selected THE SYSTEM SHALL let the user set that provider's API key (or base URL, for the local provider) and choose a model from that provider's list.
- **R3.3** — THE SYSTEM SHALL store credentials in the platform's secure/private application storage, SHALL never write them into an exported file, and SHALL never send them anywhere except to the selected provider's own endpoint.
- **R3.4** — WHEN the user requests it THE SYSTEM SHALL verify the current provider configuration with a minimal test request and report success or the exact failure (bad key, unreachable host, unknown model).
- **R3.5** — THE SYSTEM SHALL treat the provider as optional: every other feature (import, edit, approve, export, markup round-trip) SHALL work with no provider configured.

---

### R4 — Automatic translation

> As a user, I want the app to translate the document so I have a draft to correct.

- **R4.1** — WHEN the user starts translation THE SYSTEM SHALL request a translation for every sentence that has none, sending sentences in batches with their Segment IDs and their surrounding context.
- **R4.2** — WHEN a provider returns a batch THE SYSTEM SHALL match each returned translation to its Segment ID and SHALL reject the batch if any requested ID is missing or an unrequested ID is present.
- **R4.3** — WHILE translation is running THE SYSTEM SHALL show progress (segments done / total), SHALL write each completed batch to the project immediately, and SHALL allow the user to cancel.
- **R4.4** — IF translation is cancelled or the app is closed mid-run THEN THE SYSTEM SHALL keep every batch already written and SHALL resume from the first untranslated segment on the next run.
- **R4.5** — IF a provider request fails with a transient error (network, rate limit, 5xx) THEN THE SYSTEM SHALL retry that batch with exponential backoff up to a bounded number of attempts before marking the batch failed.
- **R4.6** — IF a batch ultimately fails THEN THE SYSTEM SHALL mark its segments as failed with the error message, SHALL continue with remaining batches, and SHALL let the user retry only the failed segments.
- **R4.7** — THE SYSTEM SHALL never overwrite a translation that the user has edited or approved, unless the user explicitly requests re-translation of that segment.
- **R4.8** — THE SYSTEM SHALL let the user request translation of a single segment, of a single block, or of the whole document.
- **R4.9** — WHERE the user requests a block-level translation THE SYSTEM SHALL send the whole block as one unit and store the result as the block's translation.

---

### R5 — Two-level translation with paragraph override

> As a user, I want a paragraph translation to take precedence over its sentence translations, so I can restructure a paragraph when a sentence-by-sentence rendering reads badly.

- **R5.1** — THE SYSTEM SHALL allow each block to hold, independently: zero or one block-level translation, and zero or one translation per sentence.
- **R5.2** — WHERE a block has a non-empty block-level translation THE SYSTEM SHALL use it as the block's effective translation, regardless of its sentence translations.
- **R5.3** — WHERE a block has no block-level translation THE SYSTEM SHALL compose the block's effective translation by concatenating its sentence translations in order.
- **R5.4** — WHEN a block-level translation is present THE SYSTEM SHALL indicate in the UI that the block is overriding its sentences, and SHALL keep the sentence translations stored and viewable rather than deleting them.
- **R5.5** — WHEN the user removes a block-level translation THE SYSTEM SHALL fall back to the sentence translations that were retained.
- **R5.6** — WHERE a block is overridden THE SYSTEM SHALL derive the block's approval state from the block-level translation alone and SHALL NOT require its sentences to be approved.

---

### R6 — Aligned reading and editing view

> As a user, I want to see source and translation next to each other and edit the translation in place.

- **R6.1** — THE SYSTEM SHALL display blocks in document order, and within each block its sentences in order, each source segment paired with its translation.
- **R6.2** — THE SYSTEM SHALL be mobile-first: on a narrow viewport source and translation SHALL be stacked vertically within a segment; on a wide viewport they SHALL be laid out in two columns. The layout SHALL adapt at a defined breakpoint with no horizontal scrolling at 320 px width.
- **R6.3** — WHEN the user activates a translation THE SYSTEM SHALL make it editable in place, and SHALL persist the edit when the field loses focus or after a short idle debounce.
- **R6.4** — WHEN a translation is edited THE SYSTEM SHALL mark it as user-edited and SHALL clear its approval (an edited segment returns to unapproved).
- **R6.5** — THE SYSTEM SHALL let the user collapse a block to its block-level pair only, and expand it to reveal its sentence pairs.
- **R6.6** — THE SYSTEM SHALL render a list of 20 000 sentence pairs without loading all of them into the DOM at once, keeping scrolling smooth on a mid-range Android device.
- **R6.7** — THE SYSTEM SHALL let the user filter the view to show only: untranslated segments, unapproved segments, failed segments, or all segments.
- **R6.8** — THE SYSTEM SHALL be operable by keyboard alone and by screen reader: every segment pair SHALL be reachable, its state (translated / approved / failed / overridden) SHALL be announced, and editable fields SHALL be properly labelled.

---

### R7 — Approval and progress

> As a user, I want to mark translations as approved and see how far along I am.

- **R7.1** — THE SYSTEM SHALL let the user toggle approval on any sentence and on any block.
- **R7.2** — WHEN the user approves a block that is not overridden THE SYSTEM SHALL approve all of that block's sentences.
- **R7.3** — WHERE a block is not overridden and all its translatable sentences are approved THE SYSTEM SHALL show the block as approved.
- **R7.4** — THE SYSTEM SHALL NOT allow approval of a segment whose translation is empty.
- **R7.5** — THE SYSTEM SHALL display overall progress as the percentage of approved translatable segments, counting each non-overridden block by its sentences and each overridden block as one unit, and SHALL update it as approvals change.
- **R7.6** — THE SYSTEM SHALL display, alongside approval progress, translation coverage: the share of translatable segments that have any translation.
- **R7.7** — THE SYSTEM SHALL persist approvals with the project.
- **R7.8** — THE SYSTEM SHALL let the user jump to the next unapproved segment from anywhere in the document.

---

### R8 — Export the finished translation as `.docx`

> As a user, I want to get a Word file containing only the translation.

- **R8.1** — WHEN the user exports THE SYSTEM SHALL produce a valid `.docx` containing every block in document order, each rendered with its effective translation (R5.2, R5.3).
- **R8.2** — THE SYSTEM SHALL preserve each block's kind and formatting: heading levels, list items and their nesting, table structure, and paragraph alignment.
- **R8.3** — WHERE a block's effective translation is empty THE SYSTEM SHALL fall back to the source text of that block and SHALL report the count of such blocks to the user before writing the file.
- **R8.4** — THE SYSTEM SHALL let the user choose between two export modes: *all translations*, and *approved only*. WHERE the mode is *approved only* and a block's effective translation is not approved THE SYSTEM SHALL emit the block's **source** text and SHALL visually mark that block in the produced `.docx` (highlight) so unverified passages are obvious to the reader.
- **R8.5** — THE SYSTEM SHALL correctly encode non-Latin text (Cyrillic) and accented Latin text (Italian) in the produced file.
- **R8.6** — WHEN export completes THE SYSTEM SHALL save the file through the platform's file picker on desktop and through the system share/save sheet on Android.

---

### R9 — Export markup files for external translation

> As a user, I want to take the segmented source out of the app, translate it elsewhere, and keep the segment identity.

- **R9.1** — THE SYSTEM SHALL export a **source markup file**: plain text where every segment is preceded by a marker containing its Segment ID, blocks and their sentences both present, in document order.
- **R9.2** — THE SYSTEM SHALL export a **translation markup file** in the identical format, containing the current translations (empty where none exists).
- **R9.3** — THE marker format SHALL be unambiguous, SHALL use characters that survive copy-paste through text editors and chat clients, and SHALL be improbable in natural document text.
- **R9.4** — THE SYSTEM SHALL include in the markup file a header carrying the project's document identity, language pair and format version, so an import can be validated against the right project.
- **R9.5** — THE markup format SHALL be readable and hand-editable by a person with no tooling.

---

### R10 — Import a translated markup file

> As a user, I want to bring an externally translated file back in and have it land on the right segments.

- **R10.1** — WHEN the user imports a translation markup file THE SYSTEM SHALL parse it into Segment ID → translation pairs.
- **R10.2** — IF the file's header does not match the open project's document identity THEN THE SYSTEM SHALL warn the user and require explicit confirmation before applying.
- **R10.3** — IF the file contains Segment IDs unknown to the project THEN THE SYSTEM SHALL ignore them and report how many were ignored.
- **R10.4** — IF the file is missing Segment IDs that exist in the project THEN THE SYSTEM SHALL leave those segments untouched and report how many were missing.
- **R10.5** — BEFORE applying an import THE SYSTEM SHALL show a summary — how many translations will be added, changed, and left alone, and how many approved segments would be overwritten — and SHALL apply nothing until the user confirms.
- **R10.6** — WHEN an import is applied THE SYSTEM SHALL clear approval on every segment whose translation it changed.
- **R10.7** — IF the file is malformed (unparseable markers, duplicate IDs) THEN THE SYSTEM SHALL apply nothing and SHALL report the line number and reason of the first problem.
- **R10.8** — WHEN an import is applied THE SYSTEM SHALL make it undoable as a single operation.

---

### R11 — Persistence and restoring position

> As a user, I want the app to reopen exactly where I left it.

- **R11.1** — THE SYSTEM SHALL persist the whole project — source blocks and sentences, all translations, approvals, language pair, and provider selection — locally, with no network dependency.
- **R11.2** — WHEN any change is made THE SYSTEM SHALL persist it without an explicit save action by the user.
- **R11.3** — WHEN the app is reopened THE SYSTEM SHALL restore the last open project and SHALL open it on the page holding the segment the user was last positioned on. The stored position SHALL be a segment, never a pixel offset, so that it survives a font-size change, a different device, and an edit that moves a sentence boundary.
- **R11.4** — WHERE the platform has windows (desktop) THE SYSTEM SHALL restore the window's position, size and maximised state from the previous session.
- **R11.5** — THE SYSTEM SHALL survive an abrupt termination (process kill, Android low-memory kill) without losing more than the last few seconds of edits and without leaving the stored project corrupt or half-written.
- **R11.6** — THE SYSTEM SHALL support more than one project and SHALL let the user list, open, and delete them.

---

### R12 — Cross-platform behaviour

> As a user, I want the same app on my phone and my desktop.

- **R12.1** — THE SYSTEM SHALL build from one codebase to an Android APK and to desktop binaries.
- **R12.2** — THE SYSTEM SHALL run in a plain browser for development, with file access and secure storage falling back to browser-native equivalents and any unavailable capability disabled visibly rather than failing at runtime.
- **R12.3** — THE SYSTEM SHALL work with no network connection for everything except provider requests, and SHALL state clearly when an action needs the network.

---

### R13 — Correct sentence boundaries

> As a user, I want to fix a bad automatic sentence split, because segmentation always gets abbreviations wrong somewhere.

Automatic segmentation (R1.2) systematically mis-splits on `Dr. Smith`, `г. Москва`, `Sig. Rossi` — an abbreviation followed by a capitalised word. Rather than only mitigating this heuristically, the user gets direct control.

- **R13.1** — THE SYSTEM SHALL let the user **merge** a sentence with the following sentence in the same block.
- **R13.2** — THE SYSTEM SHALL let the user **split** a sentence into two at a chosen caret position.
- **R13.3** — THE SYSTEM SHALL NOT allow editing the source *text* of a block or sentence; merge and split SHALL only move boundaries, and the concatenation of a block's sentences SHALL always equal that block's source text.
- **R13.4** — WHEN sentences are merged THE SYSTEM SHALL concatenate their translations in order and SHALL clear the resulting sentence's approval.
- **R13.5** — WHEN a sentence is split THE SYSTEM SHALL assign the whole existing translation to the first resulting sentence, leave the second untranslated, and clear approval on both.
- **R13.6** — WHEN boundaries change THE SYSTEM SHALL assign new Segment IDs only to the sentences created, SHALL never reuse a retired ID, and SHALL keep the IDs of all other sentences in the block unchanged.
- **R13.7** — THE SYSTEM SHALL make each merge and each split individually undoable.
- **R13.8** — WHEN a markup file is exported after boundary edits THE SYSTEM SHALL reflect the current boundaries and IDs (R9).

---

### R14 — Reading a long document

*A translator works through a book over days. One list of twenty thousand rows is not a way to read one, and it is not a way to say where you are.*

- **R14.1** — THE SYSTEM SHALL divide the open document into pages and SHALL show exactly one page at a time.
- **R14.2** — A page SHALL be a range of whole paragraphs; THE SYSTEM SHALL NOT split a paragraph or separate it from its sentences across a page boundary.
- **R14.3** — WHERE a single paragraph is larger than a page THE SYSTEM SHALL give it a page of its own rather than cutting it.
- **R14.4** — THE SYSTEM SHALL let the user turn to the next and previous page, and WHEN the first or last page is reached THE SYSTEM SHALL stop there rather than wrapping round.
- **R14.5** — THE SYSTEM SHALL provide a contents listing every page with what remains to be done on it, and SHALL let the user turn to any page from it.
- **R14.6** — THE SYSTEM SHALL mark the page currently being read in the contents.
- **R14.7** — WHEN a filter is applied THE SYSTEM SHALL re-cut the document over what remains and SHALL state how many pages that is.
- **R14.8** — Page identity SHALL depend only on the document and the filter, not on viewport size, font size or device.

---

### R15 — Controls ranked by consequence

*Eleven identical buttons in one row said nothing about which of them spends money and which changes a filter.*

- **R15.1** — THE SYSTEM SHALL group every command that acts on a document on one screen, grouped by what it does to the user's work, with each group stating in plain text what it does.
- **R15.2** — THE SYSTEM SHALL give each screen at most one control that commits something, and SHALL make it visually distinct from all others.
- **R15.3** — THE SYSTEM SHALL distinguish, visually, commands that write from commands that only change what is displayed.
- **R15.4** — THE SYSTEM SHALL draw the only irreversible command differently from every other command.
- **R15.5** — THE SYSTEM SHALL state every segment state in words as well as by colour.
- **R15.6** — WHEN a translation fails THE SYSTEM SHALL show the reason given by the service, in full and wrapped, beside the segment it applies to.
- **R15.7** — THE SYSTEM SHALL keep every interactive target at least 44 px in its smaller dimension, including controls drawn as plain words.

---

### R16 — Changing the language pair of a document

- **R16.1** — THE SYSTEM SHALL let the user change the language pair of a document after it has been imported.
- **R16.2** — WHEN the pair is changed THE SYSTEM SHALL keep every existing translation and approval, and SHALL leave sentence boundaries unchanged.
- **R16.3** — THE SYSTEM SHALL state, before a translation run is started, which languages that run will use.

## 4. Requirement → verification map

Every criterion is verified by at least one automated test. Test names are fixed in `tasks.md`; this table fixes the *level*.

| Requirement | Verified by |
|---|---|
| R1.1–R1.5, R1.7 | unit (docx parser, segmenter), E2E (import flow) |
| R1.6 | performance test with a generated large fixture |
| R2 | unit (segmentation per language), E2E (language pair change preserves translations) |
| R3 | unit (provider adapters against recorded fixtures), E2E (settings flow, no-provider mode) |
| R4 | unit (batching, ID matching, retry/backoff, resume), E2E (translate run with a stub provider) |
| R5 | unit (effective-translation resolution — the core rule), E2E (override and fallback) |
| R6 | E2E (edit, collapse, filter), responsive test at 320 px and desktop width, accessibility audit |
| R6.6 | performance test (virtualised list) |
| R7 | unit (progress arithmetic incl. overridden blocks), E2E (approve flows) |
| R8 | unit (docx writer), round-trip test (import → export → re-import), E2E (export flow) |
| R9, R10 | unit (markup serialiser/parser, round-trip property test), E2E (export → edit externally → import) |
| R11 | unit (persistence layer, crash-safety), E2E (reload restores project and scroll position) |
| R12 | build check for both targets, E2E suite run against the browser build |
| R13 | unit (merge/split invariants, ID allocation, undo), E2E (fix a bad split, translations follow) |
| R14 | unit (`paginate`, `clampPage`, `pageOfSegment`, `pageSummary`), E2E (turn pages, ends do not wrap, contents, reopen on the right page) |
| R15 | E2E (one committing control per screen, states in words, touch targets), design review against the mockups |
| R16 | unit (`setLanguages` keeps translations and boundaries), manual check that the run states its pair |

---

## 5. Decisions taken during review

| # | Question | Decision |
|---|---|---|
| 1 | Sentence re-segmentation when the source language changes (R2.3) | Match surviving sentences by exact source text. Sentences whose text no longer exists lose their translation; the user is told how many before the change is applied. |
| 2 | Editing the source text | **Out of scope.** Only sentence boundary edits (merge/split) are supported — R13. Source text is immutable, which keeps the exported document faithful to the original and keeps the round-trip with markup files verifiable. |
| 3 | Cascade of un-approval (R7.2) | Approving a non-overridden block approves all its sentences; un-approving a block un-approves all its sentences. Symmetric, so the block checkbox is a plain "all/none" control. |
| 4 | Approved-only export (R8.4) | Never omit a block. Unapproved blocks are emitted as **source text with a highlight** so the gap is visible in the document rather than silently missing. |

## 6. Decision taken during implementation

- **Undo scope (R10.8, R13.7).** Undo covers exactly the operations the criteria name — applying an import, merging and splitting sentences — and not ordinary translation edits. Each entry is a whole project snapshot, which makes undo a plain restore rather than a set of inverse operations to keep in step with the domain; the price is memory, so the stack is bounded to 10 rather than 100. Ordinary edits are excluded for the same reason: on a 20 000-segment document, snapshotting every keystroke-commit would cost tens of megabytes on a phone for a capability no criterion asks for. If per-edit undo is wanted later, the way to afford it is to move `Project.entries` to a persistent map with structural sharing, not to raise the bound.
