# Golden Path #1: Commitment creation from Goal Workspace

**Status:** ✅ PASS (last run: 2026-07-17). This document is the verification script for ADR-019
Fase 2A (`docs/03-architecture/adr_019_commitment_user_model.md`, `TECH_DEBT.md` Item 32, now
Resolved). The user proposed (2026-07-17) that this walkthrough is a good candidate to become a
permanent golden-path regression test, not just a one-time verification — that proposal is now
validated: the first execution found and drove the fix of a real bug (see "Run log" below).

**Execution mode:** last run automated via an ad hoc Playwright/Chromium script (installed
on-the-fly in that session), not yet a checked-in repo spec — see
`docs/07-quality/golden_path_coverage.md` for the current Manual/Automated/CI distinction. The
steps below remain accurate for either a manual run or a future formal spec.

## Run log

- **2026-07-17, attempt 1 — FAIL.** Steps 1-5 passed (entry point reachable and hit-testable,
  Create screen opens with the Goal pre-selected, new Commitment appears immediately without a
  refresh, detail screen correct, Edit screen's Goal field correctly shows the real Goal not
  "Ninguno"). Step 6 failed: an edited description did not persist — the detail screen still showed
  "Aún no hay detalles" after saving. Root cause: `commitment.description` was never stored by
  `demo-commitments.repository.ts` and never rendered by `CommitmentMetadata.tsx`, despite being
  collected by the form and passed through every hook/API layer. Fixed end-to-end (see
  `TECH_DEBT.md` Item 32's v1.43.0 change-history entry for the full file list).
- **2026-07-17, attempt 2 — PASS.** All 7 steps clean, 0 findings. One separate, pre-existing,
  systemic bug was found and deliberately left unfixed as out of scope for this gate:
  `historyApi.getHistory` has no demo-mode branch, so "Historial" fails to load on every
  Commitment's detail screen (not just new ones) — registered as `TECH_DEBT.md` Item 33.

**This is intended to be the first entry in a `docs/07-quality/` Golden Paths library**, not a
one-off artifact tied only to Item 32 (user direction, 2026-07-17). The proposed shape — one file
per core product flow, e.g. `golden_path_goal_creation.md`, `golden_path_task_completion.md`,
`golden_path_habit_checkin.md`, `golden_path_quick_capture.md` — is meant to hold even before any
of them are automated: each is an executable specification of what "the primary experience still
works" means for that flow, independent of whether Playwright exists yet. When Playwright (or
equivalent) is available, converting these into real specs is the natural next step, starting with
this one, since it already touches navigation, forms, the demo repository, and a cross-entity
relationship in one continuous path — the shape most likely to break silently in a future refactor.

No Playwright (or any other browser automation) is currently installed in this repository — this
script is written to be run manually today. If/when Playwright is added, this is the first
candidate to convert into an automated spec, since it touches navigation, forms, the demo
repository, and the Goal↔Commitment relationship in one continuous flow — exactly the kind of path
where a regression is easy to introduce silently in future refactors.

## Why this specific path

Tracing this exact sequence (not just typecheck/jest) already caught two real bugs in
`EditCommitmentScreen.tsx` during Fase 2A's own implementation (`goalId` not prefilled, `goalId`
silently dropped on save) — see `TECH_DEBT.md` Item 32 and the
`project_commitment_task_language_collision` memory for the full history. That is direct evidence
this path is worth protecting, not just a one-off check.

## Steps

1. Open any Goal's Workspace.
2. Tap "+" on the **Compromisos** section.
   - **Expect:** Create Commitment screen opens with that Goal pre-selected in the Goal field.
3. Change the title (leave Goal as-is). Save.
   - **Expect:** navigation returns to the same Goal Workspace (not Today). The new Commitment
     appears in the Compromisos list immediately — no manual refresh, no tab switch required.
4. Tap the new Commitment to open it.
   - **Expect:** title, Goal association, and other details are correct.
5. Tap Edit.
   - **Expect:** the Goal field shows the _correct_ Goal, not "Ninguno."
   - **Expect (caveat, not a bug):** the Goal field is disabled/read-only here. A freshly created
     Commitment starts in `Active` state, and Goal reassignment is only allowed in `Draft`
     (`commitmentActions.ts`'s `EDITABLE_FIELDS`). To test _changing_ the Goal via Edit, use the
     one seeded Draft Commitment instead (`c-14`, "Redesign my personal website").
6. Edit a field that _is_ editable in this state (description or priority). Save.
   - **Expect:** the change persists on reopening the Commitment.
7. Reload the whole app (full refresh, not in-app navigation).
   - **Expect:** the Commitment created in step 3 is gone. This is expected, not a defect — demo
     mode's dataset is in-memory only and does not survive a full reload, for any entity type, not
     specific to Commitments.

## Known caveats (documented, not open questions)

- **Demo persistence is in-memory.** Step 7's "disappears on reload" is by design across the whole
  app in demo mode, not something this feature needs to fix.
- **Draft→Active lifecycle is a deferred, separate decision.** `demo-commitments.repository.ts`'s
  `create()` has always started new Commitments at `Active`, skipping `Draft`, even though the real
  domain state machine starts at `Draft`. This makes step 5's Goal-editability rule correct but
  unreachable through the normal creation flow. Per explicit user direction (2026-07-17): this is
  not a Fase 2A bug to opportunistically fix — it's its own product/domain question ("what should a
  Commitment's initial lifecycle state be, and why"), with its own effects on Goal editability, UX,
  and domain rules. Treat it as a candidate for a future ADR or explicit lifecycle decision, not a
  quick fix folded into unrelated work.

## Outcome gate

**Gate passed, 2026-07-17.** Fase 2A moved from **Implemented** to **Completed** — this walkthrough
ran clean (attempt 2, 0 findings) after attempt 1's real finding was fixed. Fase 2B (Quick Capture
support for Commitment) may now start as its own independent product discussion, per the user's own
decision tree — not a continuation of this implementation.

Should this path ever regress, the same rule applies again: fix the root cause, re-run the whole
script, and don't consider the gate passed again until it's clean — the discipline that already
caught three real bugs across this feature's development (two in the Edit screen, one in
description persistence), all missed by `tsc --noEmit` and jest alone.
