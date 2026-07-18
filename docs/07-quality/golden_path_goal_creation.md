# Golden Path #2: Goal creation and lifecycle, mobile app through the real backend

**Status:** ⛔ **Blocked — not failed.** The backend and the mobile write-integration built in Fase
4B work correctly (verified: the Goal was created on the real backend exactly as expected). What
blocks the walkthrough is a product decision that was never made: what should a user see
immediately after creating a Goal, given the domain's real lifecycle starts at `Draft`, not
`Active`? This mirrors the same pattern Golden Path #1 already found and deliberately left
unresolved for Commitment — see "Known caveats" there.

**Execution mode:** ad hoc Playwright/Chromium script against a live `apps/backend` (`npm run dev`,
port 4000) and the mobile app's Expo web target (port 8081), with Demo Mode explicitly OFF —
seeded via `localStorage` (`commitment-auth-storage`/`commitment-demo-mode-storage`), same approach
as Golden Path #1. Not a checked-in spec yet.

## Why this path, and why it matters more than Golden Path #1

This walkthrough exists specifically to validate ADR-021's mobile integration end-to-end — not
just that the backend compiles and passes tests, but that a real user, through the real app, can
complete the flow the backend was built for. It directly caused two governance corrections this
session: a premature "ADR-021 implementation CLOSED" claim was walked back after this walkthrough
found no UI called Rename/Complete/Archive/LinkCommitment at all (see `TECH_DEBT.md` Item 10,
"Fase 4B"), and this current blocker was found immediately after Fase 4B closed that gap.

## Steps attempted

1. Seed a real (non-demo), authenticated session via `localStorage`; navigate to the app.
   - **Result:** ✅ loads straight into Today, correctly empty (no demo seed data) — confirms real
     backend mode is genuinely active, not silently falling back to demo.
2. Navigate to the Objetivos tab.
   - **Result:** ✅ empty state correct ("No hay objetivos activos").
3. Open Quick Capture via the "+" FAB (pre-selected to "Objetivo," matching `SOURCE_DEFAULT_TYPE`).
   - **Result:** ✅ dialog opens correctly, placeholder text matches `quickCapture.placeholders.goal`.
4. Type a title, tap "Capturar."
   - **Result:** ✅ on the backend — confirmed via `GET /v1/goals` returning the new Goal with the
     correct title, `state: "Draft"`, `version: 1`. The Fase 4B `id`/`identityId` fix
     (`useCreateCommitment`-style pattern applied to `QuickCaptureDialog`'s Goal branch, already
     present since Fase 4) worked correctly.
5. Verify the Goal appears in the Objetivos list.
   - **Result:** ⛔ **Blocked.** The Goal does not appear under any of `ObjectivesTab.tsx`'s three
     chips — "Activos" (`state === 'Active'`), "En progreso" (`Active` + `progress > 0`),
     "Completados" (`state === 'Completed'`). A `Draft` Goal matches none of them and is invisible
     from the entire screen.
     6–10 (open Workspace, rename, link Commitment/Habit, complete, view history). Not attempted — step
     5 already makes the Goal undiscoverable through the UI a real user would use.

## Root cause

`Goal.register()` (the real domain aggregate) always starts in `Draft` — this is intentional
domain design, not a bug. `demoGoalsRepository.create()` (`apps/mobile/src/core/demo/
demo-goals.repository.ts`) sets `state: 'Active'` directly, masking the divergence in Demo Mode,
where every newly created Goal has always appeared to start "Active." This is the exact same shape
of gap Golden Path #1 already found and explicitly declined to fix for Commitment (see that
document's "Known caveats" section, "Draft→Active lifecycle is a deferred, separate decision").

**Both the backend and Fase 4B's mobile integration did exactly what they were built to do.** What's
missing is a product decision about the initial visible lifecycle for a freshly created aggregate —
not specific to Goal, and not new technical debt introduced by this work.

## Outcome gate

**Not passed, not failed — blocked pending a product decision**, registered as
`PROJECT_STATUS.md`'s "Draft Lifecycle UX" candidate (consolidates this finding with Golden Path
#1's Commitment caveat, since both are instances of the same underlying question: what should a
user see immediately after creating an aggregate that starts in `Draft`?). Fase 4B's implementation
itself (`TECH_DEBT.md` Item 10) is considered done and correct — `tsc --noEmit` clean, 79/79
relevant jest tests passing — this Golden Path's block is a product-experience question, not an
implementation defect. Re-run this walkthrough once "Draft Lifecycle UX" is resolved, picking up
from step 5.
